const { WebSocket } = require('ws');
const { EventEmitter } = require('events');
const { EventType } = require('./Enums.js');

class EventsApi {

    #fetch;
    #UserAgent;

    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";

    #WebsocketClient;
    #EventEmitter = new EventEmitter();
    #IsOnline = false;
    #PingTimeout;
    #ReconnectingInterval;
    #debug;

    #eventBuffer = [];

    constructor({userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}, fetch, UserAgent) {
        this.#fetch = fetch;
        this.#UserAgent = UserAgent;
        if(!authCookie.length > 0) return this;

        this.#userid = userid;
        this.#authCookie = authCookie;
        this.#twoFactorAuth = twoFactorAuth;
        this.#debug = debug;
    }

    #Debug(x) {
        if(!this.#debug === true) return;
        console.log(x);
    }

    #GenerateHeaders(authentication = false, contentType = "") {
        var headers = new this.#fetch.Headers({
            "User-Agent": this.#UserAgent,
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    #HeartBeat() {
        clearTimeout(this.#PingTimeout);

        this.#PingTimeout = setTimeout(() => {
            this.#WebsocketClient.terminate();
            this.#WebsocketClient = undefined;

            this.lastPing = undefined;
            this.#ReconnectingInterval = setInterval(() => {
                if(this.#WebsocketClient) this.#WebsocketClient.terminate();
                this.Connect();
            }, 1000);
        }, 30000 + 2500)
    }

    // Connects to the Websocket Client to VRChat's backend Websocket Servers with authentication.
    Connect() {
        if(!this.#authCookie) return { success: false, status: 401 };

        this.#WebsocketClient = new WebSocket(`wss://vrchat.com/?authToken=${this.#authCookie}`, { headers: { "cookie": `auth=${this.#authCookie};${this.#twoFactorAuth ? " " + "twoFactorAuth=" + this.#twoFactorAuth + ";" : ""}`, "user-agent": this.#UserAgent } });

        // Handler for user online/offline events.
        var UserEvent = async (content) => {
            clearInterval(this.OnlineInterval);
            this.OnlineInterval = setInterval(async () => {
                this.#Debug("ONLINE INTERVAL TIMEOUT");
        
                const res = await this.#fetch(`https://api.vrchat.cloud/api/1/users/${this.#userid}`, { headers: this.#GenerateHeaders(true) });
                if(!res.ok) {
                    clearInterval(this.OnlineInterval);
                    
                    this.#IsOnline = false;
                    this.#EventEmitter.emit('user-offline', { userid: this.#userid });
                    return;
                };

                const json = await res.json();
                if(json.state !== "online") {
                    clearInterval(this.OnlineInterval);
                    
                    this.#IsOnline = false;
                    this.#EventEmitter.emit('user-offline', json);
                }
            }, 150000);

            if(this.#IsOnline === false) {
                this.#IsOnline = true;
        
                const res = await this.#fetch(`https://api.vrchat.cloud/api/1/users/${this.#userid}`, { headers: this.#GenerateHeaders(true) });
                if(!res.ok) {
                    this.#EventEmitter.emit('user-online', content);
                    return;
                };

                const json = await res.json();
                this.#EventEmitter.emit('user-online', json);
            };
        };

        this.#WebsocketClient.on('error', (err) => {
            this.#EventEmitter.emit('error', err);
        });

        this.#WebsocketClient.on('open', () => {
            clearInterval(this.#ReconnectingInterval);
            this.#Debug("OPEN");
            this.#HeartBeat();
        });
        
        this.#WebsocketClient.on('close', () => {
            this.#Debug('CLOSE');
        });

        this.#WebsocketClient.on('message', async (data, isBuffer) => {
            const dataParsed = isBuffer ? JSON.parse(data.toString()) : JSON.parse(data);
            var content;

            try {
                content = JSON.parse(dataParsed.content);
            } catch(e) {
                content = dataParsed.content;
            }

            if(!["user-online", "user-update", "user-location", "user-offline", "friend-online", "friend-active", "friend-update", "friend-location", "friend-offline", "friend-add", "friend-delete", "notification", "see-notification", "hide-notification"].includes(dataParsed.type)) console.log("NON-INDEXED WEBSOCKET EVENT TYPE: " + dataParsed.type + " (Please report this, though this event will still work if you pass it to the #on event method as a string e.g. \"user-online\").");
            if(dataParsed.type === "user-location") await UserEvent(content);

            var id = content.userId ? content.userId : "";

            // Preventing duplicate events.
            if(id) {
                var eventBuffered = false;
                for(var i = 0; i < this.#eventBuffer.length; i++) {
                    if(this.#eventBuffer[i][1] == dataParsed.type && this.#eventBuffer[i][0] == id) {
                        eventBuffered = true;
                        this.#Debug('prevented duplicate event: '+dataParsed.type);
                        this.#Debug(this.#eventBuffer);
                        clearTimeout(this.#eventBuffer[i][2]);
                        var timeout = setTimeout(() => {
                            for(var j = 0; j < this.#eventBuffer.length; j++) {
                                if(this.#eventBuffer[j].includes(dataParsed.type) && this.#eventBuffer[j].includes(id)) this.#eventBuffer.splice(j, 1);
                            }
                        }, 100);
                        this.#eventBuffer[i][2] = timeout;
                    }
                }

                if(!eventBuffered) {
                    this.#EventEmitter.emit(dataParsed.type, content);
                    var timeout = setTimeout(() => {
                        for(var j = 0; j < this.#eventBuffer.length; j++) {
                            if(this.#eventBuffer[j].includes(dataParsed.type) && this.#eventBuffer[j].includes(id)) this.#eventBuffer.splice(j, 1);
                        }
                    }, 100);
                    this.#eventBuffer.push([id, dataParsed.type, timeout]);
                }
            } else {
                this.#EventEmitter.emit(dataParsed.type, content);
            }
        });

        this.#WebsocketClient.on('ping', () => {
            this.#HeartBeat();

            this.#Debug('ping' + (this.lastPing ? " ("+(Date.now() - this.lastPing)+"ms interval)" : ""));
            this.lastPing = Date.now();
        });
    }

    /**
     * Closes websocket connection and removes all event listeners.
     */
    Disconnect() {
        if(this.#WebsocketClient) {
            clearTimeout(this.#PingTimeout);
            clearInterval(this.#ReconnectingInterval);
            clearInterval(this.OnlineInterval);

            this.#WebsocketClient.close();
            this.#EventEmitter.removeAllListeners();

            this.#WebsocketClient = undefined;
            this.lastPing = undefined;
        }
    }

    /**
     * Subscribe to websocket events and attach handler function.
     */
    on(event = EventType, handlerCallback = () => {}) {
        if(!event instanceof EventType) {
            this.#EventEmitter.on(event, handlerCallback);
            return;
        }

        this.#EventEmitter.on(event.type, handlerCallback);
    }
}

module.exports = { EventsApi };