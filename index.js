/*
<Nodejs library to interface with the vrchat's backend REST API>
    Copyright (C) <2023>  <Solitarju> 

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// RAUERUAURURAUEAURUARUE! Did I scare you? yeah I bet I did, you coward. You make me sick, your weakness is pathetic.
// Also hello! Why are you poking around inside my source code? :totally_a_flushed_emoji:
// Coding this made me realise why Typescript exists, also makes me wonder why I haven't learnt it yet.

const fetch = require('node-fetch');
const { EventEmitter } = require('events');
const { WebSocket } = require('ws');

class EventType {

    static userOnline = new EventType('user-online');
    static userUpdate = new EventType('user-update');
    static userLocation = new EventType('user-location');
    static userOffline = new EventType('user-offline');
    static friendOnline = new EventType('friend-online');
    static friendActive = new EventType('friend-active');
    static friendUpdate = new EventType('friend-update');
    static friendLocation = new EventType('friend-location');
    static friendOffline = new EventType('friend-offline');
    static friendAdd = new EventType('friend-add');
    static friendDelete = new EventType('friend-delete');
    static notification = new EventType('notification');
    static showNotification = new EventType('show-notification');
    static hideNotification = new EventType('hide-notification');
    static error = new EventType('error');

    constructor(type) {
        this.type = type;
    }
}

class QueryOrder {

    static ascending = new QueryOrder("ascending");
    static descending = new QueryOrder("descending");

    constructor(type) {
        this.type = type;
    }
}

class QuerySort {

    static popularity = new QuerySort("popularity");
    static heat = new QuerySort("heat");
    static trust = new QuerySort("trust");
    static shuffle = new QuerySort("shuffle");
    static random = new QuerySort("random");
    static favorites = new QuerySort("favorites");
    static reportScore = new QuerySort("reportScore");
    static reportCount = new QuerySort("reportCount");
    static publicationDate = new QuerySort("publicationDate");
    static labsPublicationDate = new QuerySort("labsPublicationDate");
    static created = new QuerySort("created");
    static _created_at = new QuerySort("_created_at");
    static updated = new QuerySort("updated");
    static _updated_at = new QuerySort("_updated_at");
    static order = new QuerySort("order");
    static relevance = new QuerySort("relevance");
    static magic = new QuerySort("magic");
    static name = new QuerySort("name");

    constructor(type) {
        this.type = type;
    }
}

class QueryReleaseStatus {

    static public = new QueryReleaseStatus("public");
    static private = new QueryReleaseStatus("private");
    static hidden = new QueryReleaseStatus("hidden");
    static all = new QueryReleaseStatus("all");

    constructor(type) {
        this.type = type;
    }
}

class Enums {

    static EventType = EventType;
    static QueryOrder = QueryOrder;
    static QuerySort = QuerySort;
    static QueryReleaseStatus = QueryReleaseStatus;

    constructor() {

    }
}

class EventsApi {

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

    constructor({userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
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

        this.#WebsocketClient = new WebSocket(`wss://vrchat.com/?authToken=${this.#authCookie}`, { headers: { "cookie": `auth=${this.#authCookie};${this.#twoFactorAuth ? " " + "twoFactorAuth=" + this.#twoFactorAuth + ";" : ""}`, "user-agent": "node-vrchat-api/1.2.0 contact@solitarju.uk" } });

        // Handler for user online/offline events.
        var UserEvent = async (content) => {
            clearInterval(this.OnlineInterval);
            this.OnlineInterval = setInterval(async () => {
                this.#Debug("ONLINE INTERVAL TIMEOUT");
        
                const res = await fetch(`https://api.vrchat.cloud/api/1/users/${this.#userid}`, { headers: this.#GenerateHeaders(true) });
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
        
                const res = await fetch(`https://api.vrchat.cloud/api/1/users/${this.#userid}`, { headers: this.#GenerateHeaders(true) });
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

class AuthenticationApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

    constructor({userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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

    #GenerateHeaders(authentication = false, contentType = "", authCookie = "", twoFactorAuth = "") {
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${(this.#authCookie || authCookie) && authentication ? "auth=" + (authCookie ? authCookie : this.#authCookie) + "; " : ""}${(this.#twoFactorAuth || twoFactorAuth) && authentication ? "twoFactorAuth=" + (twoFactorAuth ? twoFactorAuth : this.#twoFactorAuth) + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    /**
     * 
     * Checks if a user exists on vrchat by using email, username or displayname (prioritizes that order).
     * 
     * @returns {Promise<Boolean>} Boolean value inidicating whether user exists.
     */
    async UserExists({ email = "", username = "", displayName = "", excludeUserId = ""} = {}) {
        if(!email.length > 0 && !displayName.length > 0 && !username.length > 0) throw Error('Missing argument(s) email, displayName or userId');

        const exclusion = excludeUserId.length > 0 ? `&excludeUserId=${excludeUserId}` : "";

        if(email.length > 0) {
            const res = await fetch(`${this.#APIEndpoint}/auth/exists?email=${email}${exclusion}`, { headers:  this.#GenerateHeaders() });
            if(!res.ok) return { success: false, status: res.status };

            const json = await res.json();
            return { success: true, userExists: json.userExists };
        }

        if(username.length > 0) {
            const res = await fetch(`${this.#APIEndpoint}/auth/exists?username=${username}${exclusion}`, { headers:  this.#GenerateHeaders() });
            if(!res.ok) return { success: false, status: res.status };

            const json = await res.json();
            return { success: true, userExists: json.userExists };
        }

        if(displayName.length > 0) {
            const res = await fetch(`${this.#APIEndpoint}/auth/exists?displayName=${displayName}${exclusion}`, { headers:  this.#GenerateHeaders() });
            if(!res.ok) return { success: false, status: res.status }; 
            
            const json = await res.json();
            return { success: true, userExists: json.userExists };
        }
    }

    /**
     * 
     * Attempts authentication either by using username and password but prioritizing authCookie for session re-using.
     * 
     * @returns {Promise<JSON>} Returns JSON (with credentials if success) indicating whether login attempt invalid, successful or requires 2fa.
     */
    async Login({username = "", password = "", authCookie = "", twoFactorAuth = ""} = {}) {
        if(!authCookie) {
            if(!username && !password) throw Error("Missing argument(s) username and password or authCookie");
        }

        if(authCookie.length > 0) {

            const res = await fetch(`${this.#APIEndpoint}/auth/user`, { headers: this.#GenerateHeaders(true, "", authCookie, twoFactorAuth) });
            if(!res.ok) {
                // do this so if invalid authcookie, if username and password credentials are passed it will move on to next statement to try those too.
                if(!username && !password) return { success: false, status: res.status };
            };

            if(res.ok) {
                const json = await res.json();
                if(json.requiresTwoFactorAuth) {
                    return { success: false, authCookie: authCookie, json: json };
                }
    
                return { success: true, authCookie: authCookie, twoFactorAuth: twoFactorAuth,  json: json };
            }
        }

        console.warn("Logging in with username and password (creating new session), consider saving session details and reusing them using the getAuthentication method.");

        if(username.length  > 0 && password.length > 0) {
            const Headers = new fetch.Headers({
                "User-Agent": "node-vrchat-api/1.0.0a",
                "authorization": `Basic ${username.length > 0 && password.length > 0 ? btoa(`${encodeURI(username)}:${encodeURI(password)}`) : ""}`
            });

            const res = await fetch(`${this.#APIEndpoint}/auth/user`, { headers: Headers });
            if(!await res.ok) return { success: false, status: res.status };

            const json = await res.json();

            const headers = await res.headers.get('set-cookie');
            const _authCookie = headers.substring(headers.indexOf("auth=") + 5, headers.substring(headers.indexOf("auth=") + 5).indexOf(";") + 5);

            if(json.requiresTwoFactorAuth) {
                return { success: false, authCookie: _authCookie, json: json };
            }

            return { success: true, authCookie: _authCookie, json: json };
        }
    }

    /**
     * 
     * Returns JSON userObject of the user currently authenticated.
     * 
     * @returns {Promise<JSON>} Returns boolean indicating success and if successful user JSON object. { success: Boolean, json: JSON }
     */
    async GetCurrentUser() {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/users/${this.#userid}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, json: await res.json() };
    }

    /**
     * 
     * Finishes the login sequence with a normal 2FA-generated code for accounts with 2FA-protection enabled.
     * 
     * @returns {Promise<JSON>} Returns JSON with boolean value "verified" and string twoFactorAuth.
     */
    async verifyTotp(authCookie = "", totp = "") {
        if(!authCookie.length > 0 || !totp.length > 0) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/auth/twofactorauth/totp/verify`, { method: "POST", headers: this.#GenerateHeaders(true, "application/json", authCookie), body: JSON.stringify({ "code": totp }) });
        if(!res.ok) return { success: false, error: res.status };

        const json = await res.json();

        const responseHeaders = await res.headers.get('set-cookie');
        const twoFactorAuthCode = responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14, responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14).indexOf(";") + 14);

        return { success: json.verified, twoFactorAuth: twoFactorAuthCode };
    }

    /**
     * 
     * Finishes the login sequence with an OTP (One Time Password) recovery code for accounts with 2FA-protection enabled.
     * 
     * @returns {Promise<JSON>} Returns JSON with boolean value "verified" and string twoFactorAuth.
     */
    async verifyOtp(authCookie = "", otp = "") {
        if(!authCookie.length > 0 || !otp.length > 0) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/auth/twofactorauth/otp/verify`, { method: "POST", headers: this.#GenerateHeaders(true, "application/json", authCookie), body: JSON.stringify({ "code": otp }) });
        if(!res.ok) return { success: false, error: res.status };

        const json = await res.json();

        const responseHeaders = await res.headers.get('set-cookie');
        const twoFactorAuthCode = responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14, responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14).indexOf(";") + 14);

        return { success: json.verified, twoFactorAuth: twoFactorAuthCode };
    }

    /**
     * 
     * Finishes the login sequence with an 2FA email code.
     * 
     * @returns {Promise<JSON>} Returns JSON with boolean value "verified" and string twoFactorAuth.
     */
    async verifyEmailOtp(authCookie = "", emailotp = "") {
        if(!authCookie.length > 0 || !emailotp.length > 0) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/auth/twofactorauth/emailotp/verify`, { method: "POST", headers: this.#GenerateHeaders(true, "application/json", authCookie), body: JSON.stringify({ code: emailotp }) });
        if(!res.ok) return { success: false, error: res.status };

        const json = await res.json();

        const responseHeaders = await res.headers.get('set-cookie');
        const twoFactorAuthCode = responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14, responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14).indexOf(";") + 14);

        return { success: json.verified, twoFactorAuth: twoFactorAuthCode };
    }

    /**
     * 
     * Verifies whether provided session token/auth cookie is currently valid.
     * (Will always log error to the console if token invalid, even if no error has occurred).
     * 
     * @returns {Promise<boolean>} Returns boolean indicating validity of token/cookie.
     */
    async VerifyAuthToken(authCookie="") {
        if(!authCookie.length > 0) return { success: true, ok: false };

        const res = await fetch(`${this.#APIEndpoint}/auth`, { headers: this.#GenerateHeaders(true, "", authCookie) });
        if(!res.ok) return { success: false, status: res.status };
        
        const json = await res.json();
        if(!json.ok) return { success: false, status: res.status };

        return { success: true, ok: json.ok};
    }

    /**
     * 
     * Invalidates currently authenticated session authCookie.
     * 
     * @returns {Promise<Boolean>} Returns boolean indicating whether function was successful.
     */
    async Logout(authCookie) {
        if(!authCookie) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/logout`, { method: "PUT", headers: this.#GenerateHeaders(true, "", authCookie), body: JSON.stringify({ "auth": authCookie }) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true };
    }

    /**
     * 
     * Returns JSON object of all credentials required for vrchat's api.
     * 
     * @returns {JSON} Returns JSON object of all credentials required for vrchat's api.
     */
    GetAuthentication() {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };

        return { success: true, userid: this.#userid, authCookie: this.#authCookie, twoFactorAuth: this.#twoFactorAuth };
    }
}

class AvatarsApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    #GenerateParameters(params = {}) {
        var paramString = "";
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value) return;
            if(value === QuerySort) return;
            if(value === QueryOrder) return;
            if(value === QueryReleaseStatus) return;

            if(key === "n" && value === 60) return; // Omit n parameter if equal to 60 as it is the default value.
            if(key === "user" && value === true) value = "me";
            if(key === "sort" && value instanceof QuerySort) value = value.type;
            if(key === "order" && value instanceof QueryOrder) value = value.type;
            if(key === "releaseStatus" && value instanceof QueryReleaseStatus) value = value.type;
            // ew this is yucky, but idk what else I can do here

            if(paramString) {
                paramString += `&${key}=${value}`;
                return;
            }

            paramString += `${key}=${value}`;
        });
        return paramString;
    }

    /**
     * 
     * Get the avatar for the current authenticated user.
     * 
     * @returns {Promise<JSON>}
     */
    async GetOwnAvatar() {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/users/${this.#userid}/avatar`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Search and list avatars by query filters. You can only search your own or featured avatars. It is not possible as a normal user to search other peoples avatars.
     * 
     * @returns {Promise<JSON>}
     */
    async SearchAvatars({ featured = false, sort = QuerySort, user = false, userId = "", n = 60, order = QueryOrder, offset = 0, tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const params = this.#GenerateParameters({ featured, sort, user, userId, n, order, offset, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform });
        const res = await fetch(`${this.#APIEndpoint}/avatars${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Create an avatar. It's possible to optionally specify a ID if you want a custom one. Attempting to create an Avatar with an already claimed ID will result in a DB error.
     * 
     * @returns {Promise<JSON>}
     */
    async CreateAvatar({ assetUrl = "", id = "", name = "", description = "", tags = [], imageUrl = "", releaseStatus = QueryReleaseStatus, version = 1, unityPackageUrl = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/avatars`, { method: 'POST', body: JSON.stringify({ assetUrl: assetUrl, id: id, name: name, description: description, tags: tags, imageUrl: imageUrl, releaseStatus: releaseStatus, version: version, unityPackageUrl: unityPackageUrl }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Get information about a specific Avatar by id.
     * 
     * @returns {Promise<JSON>}
     */
    async GetAvatar(avatarId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!avatarId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/avatars/${avatarId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Update information about a specific avatar.
     * 
     * @returns {Promise<JSON>}
     */
    async UpdateAvatar({ assetUrl = "", id = "", name = "", description = "", tags = [], imageUrl = "", releaseStatus = Enums.QueryReleaseStatus.public, version = 1, unityPackageUrl = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!id) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/avatars/${id}`, { method: 'PUT', body: JSON.stringify({ assetUrl: assetUrl, id: id, name: name, description: description, tags: tags, imageUrl: imageUrl, releaseStatus: releaseStatus, version: version, unityPackageUrl: unityPackageUrl }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Delete an avatar. Notice an avatar is never fully "deleted", only its ReleaseStatus is set to "hidden" and the linked Files are deleted. The AvatarID is permanently reserved.
     * 
     * @returns {Promise<JSON>}
     */
    async DeleteAvatar(avatarId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!avatarId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/avatars/${avatarId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Switches authenticated user into that avatar.
     * 
     * @returns {Promise<JSON>}
     */
    async SelectAvatar(avatarId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!avatarId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/avatars/${avatarId}/select`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Switches authenticated user into that avatar as your fallback avatar.
     * 
     * @returns {Promise<JSON>}
     */
    async SelectFallbackAvatar(avatarId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!avatarId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/avatars/${avatarId}/selectFallback`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Search and list favorited avatars by query filters.
     * 
     * @returns {Promise<JSON>}
     */
    async ListFavoritedAvatars({ featured = true, sort = QuerySort, n = 60, order = QueryOrder, offset = 0, search = "", tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "", userId = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const params = this.#GenerateParameters({ featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId });
        const res = await fetch(`${this.#APIEndpoint}/avatars/favorites${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }
}

class EconomyApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }


    /**
     * 
     * Get all own Steam transactions.
     * 
     * @returns {Promise<JSON>}
     */
    async ListSteamTransactions() {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/Steam/transactions`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Get a list of all current user subscriptions.
     * 
     * @returns {Promise<JSON>}
     */
    async GetCurrentSubscriptions() {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/auth/user/subscription`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * List all existing Subscriptions. For example, "vrchatplus-monthly" and "vrchatplus-yearly".
     * 
     * @returns {Promise<JSON>}
     */
    async ListSubscriptions() {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/subscriptions`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Get a single License Group by given ID.
     * 
     * @returns {Promise<JSON>}
     */
    async GetLicenseGroup(licenseGroupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!licenseGroupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/licenseGroups/${licenseGroupId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

class FavoritesApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    #GenerateParameters(params = {}) {
        var paramString = "";
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value) return;
            if(key === "n" && value === 60) return; // Omit n parameter if equal to 60 as it is the default value.
            
            if(paramString) {
                paramString += `&${key}=${value}`;
                return;
            }

            paramString += `${key}=${value}`;
        });
        return paramString;
    }

    /**
     * 
     * Returns a list of favorites.
     * 
     * @returns {Promise<JSON>}
     */
    async ListFavorites({ n= 60, offset = 0, type = "", tag = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const params = this.#GenerateParameters({ n, offset, type, tag });
        const res = await fetch(`${this.#APIEndpoint}/favorites${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Add a new favorite, friend groups are named group_0 through group_3 while Avatar and World groups are named avatars1 to avatars4 and worlds1 to worlds4.
     * 
     * @returns {Promise<JSON>}
     */
    async AddFavorite({ type = "", favoriteId = "", tags = [] } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!type || !favoriteId || tags.length < 1) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/favorites`, { method: 'POST', body: JSON.stringify({ type, favoriteId, tags }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Return information about a specific Favorite.
     * 
     * @returns {Promise<JSON>}
     */
    async ShowFavorite(favoriteId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!favoriteId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/favorites/${favoriteId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Remove a favorite from your favorites list.
     * 
     * @returns {Promise<JSON>}
     */
    async RemoveFavorite(favoriteId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!favoriteId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/favorites/${favoriteId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Return a list of favorite groups owned by a user.
     * 
     * @returns {Promise<JSON>}
     */
    async ListFavoriteGroups({ n = 60, offset = 0, ownerId = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const params = this.#GenerateParameters({ n, offset, ownerId });
        const res = await fetch(`${this.#APIEndpoint}/favorite/groups${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Fetch information about a specific favorite group.
     * 
     * @returns {Promise<JSON>}
     */
    async ShowFavoriteGroup(favoriteGroupType = "", favoriteGroupName = "", userId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!favoriteGroupType || !favoriteGroupName || !userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/favorite/group/${favoriteGroupType}/${favoriteGroupName}/${userId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Update information about a specific favorite group.
     * 
     * @returns {Promise<JSON>}
     */
    async UpdateFavoriteGroup({ favoriteGroupType = "", favoriteGroupName = "", userId = "", displayName = "", visibility = "", tags = [] } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!favoriteGroupType || !favoriteGroupName || !userId) return { success: false, status: 400 };

        const params = { displayName, visibility };
        if(tags.length > 0) params.tags = tags;

        const res = await fetch(`${this.#APIEndpoint}/favorite/group/${favoriteGroupType}/${favoriteGroupName}/${userId}`, { method: 'PUT', body: JSON.stringify(params), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Clear ALL contents of a specific favorite group.
     * 
     * @returns {Promise<JSON>}
     */
    async ClearFavoriteGroup(favoriteGroupType = "", favoriteGroupName = "", userId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!favoriteGroupType || !favoriteGroupName || !userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/favorite/group/${favoriteGroupType}/${favoriteGroupName}/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

class FilesApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    #GenerateParameters(params = {}) {
        var paramString = "";
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value) return;
            if(key === "n" && value === 60) return; // Omit n parameter if equal to 60 as it is the default value.
            
            if(paramString) {
                paramString += `&${key}=${value}`;
                return;
            }

            paramString += `${key}=${value}`;
        });
        return paramString;
    }

    /**
     * 
     * Returns a list of files.
     * 
     * @returns {Promise<JSON>}
     */
    async ListFiles({ tag = "", n = 60, offset = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const params = this.#GenerateParameters({ tag, n, offset });
        const res = await fetch(`${this.#APIEndpoint}/files${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Creates a new File object.
     * 
     * @returns {Promise<JSON>}
     */
    async CreateFile({ name = "", mimeType = "", extension = "", tags = [] } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!name || !mimeType || !extension) return { success: false, status: 400 };

        const bodyData = { name, mimeType, extension };
        if(tags.length > 0) bodyData.tags = tags;

        const res = await fetch(`${this.#APIEndpoint}/file`, { method: 'POST', body: JSON.stringify(bodyData), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Shows general information about the "File" object. Each File can have several "Version"'s, and each Version can have multiple real files or "Data" blobs.
     * 
     * @returns {Promise<JSON>}
     */
    async ShowFile(fileId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/file/${fileId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Creates a new FileVersion. Once a Version has been created, proceed to the /file/{fileId}/{versionId}/file/start endpoint to start a file upload.
     * 
     * @returns {Promise<JSON>}
     */
    async CreateFileVersion({ fileId = "", signatureMd5 = "", signatureSizeInBytes = 0, fileMd5 = "", fileSizeInBytes = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !signatureMd5 || !signatureSizeInBytes) return { success: false, status: 400 };

        const bodyData = { signatureMd5, signatureSizeInBytes };
        if(fileMd5) bodyData.fileMd5 = fileMd5;
        if(fileSizeInBytes) bodyData.fileSizeInBytes = fileSizeInBytes;

        const res = await fetch(`${this.#APIEndpoint}/file/${fileId}`, { method: 'POST', body: JSON.stringify(bodyData), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes a File object.
     * 
     * @returns {Promise<JSON>}
     */
    async DeleteFile(fileId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/file/${fileId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Downloads the file with the provided version number. (Please read extra notes here https://vrchatapi.github.io/docs/api/#get-/favorites/-favoriteId-)
     * 
     * @returns {Promise<JSON>}
     */
    async DownloadFileVersion(fileId = "", versionId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !versionId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/file/${fileId}/${versionId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Delete a specific version of a file. You can only delete the latest version.
     * 
     * @returns {Promise<JSON>}
     */
    async DeleteFileVersion(fileId = "", versionId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !versionId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/file/${fileId}/${versionId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Finish an upload of a FileData. This will mark it as "complete". After uploading the file for Avatars and Worlds you then have to upload a signature file.
     * 
     * @returns {Promise<JSON>}
     */
    async FinishFileDataUpload({fileId = "", versionId = "", fileType = "", etags = []} = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !versionId || !fileType) return { success: false, status: 400 };

        const bodyData = etags.length > 0 ? { etags } : "";
        const res = await fetch(`${this.#APIEndpoint}/file/${fileId}/${versionId}/${fileType}/finish`, { method: 'PUT', body: bodyData ? JSON.stringify(bodyData) : "", headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Starts an upload of a specific FilePart. This endpoint will return an AWS URL which you can PUT data to. You need to call this and receive a new AWS API URL for each partNumber. Please see AWS's REST documentation on "PUT Object to S3" on how to upload. Once all parts have been uploaded, proceed to /finish endpoint.
     * 
     * @returns {Promise<JSON>}
     */
    async StartFileDataUpload(fileId = "", versionId = "", fileType = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !versionId || !fileType) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/file/${fileId}/${versionId}/${fileType}/start`, { method: 'PUT', headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Retrieves the upload status for file upload. Can currently only be accessed when status is waiting. Trying to access it on a file version already uploaded currently times out.
     * 
     * @returns {Promise<JSON>}
     */
    async CheckFileDataUploadStatus(fileId = "", versionId = "", fileType = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !versionId || !fileType) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/file/${fileId}/${versionId}/${fileType}/status`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

class FriendsApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    #GenerateParameters(params = {}) {
        var paramString = "";
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value) return;
            if(key === "n" && value === 60) return; // Omit n parameter if equal to 60 as it is the default value.
            
            if(paramString) {
                paramString += `&${key}=${value}`;
                return;
            }

            paramString += `${key}=${value}`;
        });
        return paramString;
    }

    /**
     * 
     * List information about friends.
     * 
     * @returns {Promise<JSON>}
     */
    async ListFriends({ offset = 0, n = 60, offline = false } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const params = this.#GenerateParameters({ offset, n, offline });
        const res = await fetch(`${this.#APIEndpoint}/auth/user/friends${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Send a friend request to another user.
     * 
     * @returns {Promise<JSON>}
     */
    async SendFriendRequest(userId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!userId) return { success: false, status: 400 };
        
        const res = await fetch(`${this.#APIEndpoint}/user/${userId}/friendRequest`, { method: 'POST', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes an outgoing friend request to another user. To delete an incoming friend request, use the deleteNotification method instead.
     * 
     * @returns {Promise<JSON>}
     */
    async DeleteFriendRequest(userId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!userId) return { success: false, status: 400 };
        
        const res = await fetch(`${this.#APIEndpoint}/user/${userId}/friendRequest`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Retrieve if the user is currently a friend with a given user, if they have an outgoing friend request, and if they have an incoming friend request. The proper way to receive and accept friend request is by checking if the user has an incoming Notification of type friendRequest, and then accepting that notification.
     * 
     * @returns {Promise<JSON>}
     */
    async CheckFriendStatus(userId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/user/${userId}/friendStatus`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Unfriend a user by ID. :'(
     * 
     * @returns {Promise<JSON>}
     */
    async Unfriend(userId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/auth/user/friends/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }
}

class GroupsApi {
    
    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    #GenerateParameters(params = {}) {
        var paramString = "";
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value) return;
            if(key === "n" && value === 60) return; // Omit n parameter if equal to 60 as it is the default value.
            
            if(paramString) {
                paramString += `&${key}=${value}`;
                return;
            }

            paramString += `?${key}=${value}`;
        });
        return paramString;
    }

    #GenerateBody(params = {}) {
        var json = {};
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value) return;
            if(!value.length) return;
            
            json[key] = value;
        });
        return JSON.stringify(json);
    }

    /**
     * 
     * Creates a Group and returns a Group object. **Requires VRC+ Subscription.**
     * 
     * @returns {Promise<JSON>} 
     */
    async CreateGroup({ name = "", shortCode = "", description = "", joinState = "", iconId = "", bannerId = "", privacy = "", roleTemplate = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!name || !shortCode || !roleTemplate) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups`, { method: 'POST', body: this.#GenerateBody({ name, shortCode, description, joinState, iconId, bannerId, privacy, roleTemplate }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a single Group by ID.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupById({ groupId = "", includeRoles = false } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}${this.#GenerateParameters(includeRoles)}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Updates a Group and returns it.
     * 
     * @returns {Promise<JSON>} 
     */
    async UpdateGroup({ groupId = "", name = "", shortCode = "", description = "", joinState = "", iconId = "", bannerId = "", privacy = "", roleTemplate = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}`, { method: 'PUT', body: this.#GenerateBody({ name, shortCode, description, joinState, iconId, bannerId, privacy, roleTemplate }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteGroup(groupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns the announcement for a Group. If no announcement has been made, then it returns **empty object**. If an announcement exists, then it will always return all fields except imageId and imageUrl which may be null.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupAnnouncement(groupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/announcement`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Creates an Announcement for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async CreateGroupAnnouncement({ groupId = "", title = "", text = "", imageId = "", sendNotification = false } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !title) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/announcement`, { method: 'POST', body: this.#GenerateBody({ title, text, imageId, sendNotification }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes the announcement for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteGroupAnnouncement(groupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/announcement`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a list of audit logs for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupAuditLogs({ groupId = "", n = 60, offset = 0, startDate = "", endDate = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/auditLogs${this.#GenerateParameters({ n, offset, startDate, endDate })}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a list of banned users for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupBans({ groupId = "", n = 60, offset = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/bans${this.#GenerateParameters({ n, offset })}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Bans a user from a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async BanGroupMember(groupId = "", userId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/bans`, { method: 'POST', body: this.#GenerateBody({ userId }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Unbans a user from a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async UnbanGroupMember(groupId = "", userId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/bans/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Creates a gallery for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async CreateGroupGallery({ groupId = "", name = "", description = "", membersOnly = false, roleIdsToView = [], roleIdsToSubmit = [], roleIdsToAutoApprove = [], roleIdsToManage = [] } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !name) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries`, { method: 'POST', body: this.#GenerateBody({ name, description, membersOnly, roleIdsToView, roleIdsToSubmit, roleIdsToAutoApprove, roleIdsToManage }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a list of images for a Group gallery.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupGalleryImages({ groupId = "", galleryId = "", n = 60, offset = 0, approved = false }) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !galleryId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}${this.#GenerateParameters({ n, offset, approved })}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Updates a gallery for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async UpdateGroupGallery({ groupId = "", groupGalleryId = "", name = "", description = "", membersOnly = false, roleIdsToView = [], roleIdsToSubmit = [], roleIdsToAutoApprove = [], roleIdsToManage = [] } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupGalleryId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}`, { method: 'PUT', body: this.#GenerateBody({ name, description, membersOnly, roleIdsToView, roleIdsToSubmit, roleIdsToAutoApprove, roleIdsToManage }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes a gallery for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteGroupGallery(groupId = "", groupGalleryId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupGalleryId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Adds an image to a Group gallery.
     * 
     * @returns {Promise<JSON>} 
     */
    async AddGroupGalleryImage(groupId = "", groupGalleryId = "", fileId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupGalleryId || !fileId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}/images`, { method: 'PUT', body: this.#GenerateBody({ fileId }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes an image from a Group gallery.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteGroupGalleryImage(groupId = "", groupGalleryId = "", groupGalleryImageId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupGalleryId || !groupGalleryImageId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}/images/${groupGalleryImageId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a list of members that have been invited to the Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupInvitesSent(groupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/invites`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Sends an invite to a user to join the group.
     * 
     * @returns {Promise<JSON>} 
     */
    async InviteUserToGroup({ groupId = "", userId = "", confirmOverrideBlock = true } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/invites`, { method: 'POST', body: this.#GenerateBody({ userId, confirmOverrideBlock }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes an Group invite sent to a User.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteUserInvite(groupId = "", userId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/invites/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Join a Group by ID and returns the member object.
     * 
     * @returns {Promise<JSON>} 
     */
    async JoinGroup(groupId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/join`, { method: 'POST', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Leave a group by ID.
     * 
     * @returns {Promise<JSON>} 
     */
    async LeaveGroup(groupId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/leave`, { method: 'POST', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a List of all **other** Group Members. This endpoint will never return the user calling the endpoint. Information about the user calling the endpoint must be found in the myMember field of the Group object.
     * 
     * @returns {Promise<JSON>} 
     */
    async ListGroupMembers({ groupId = "", n = 60, offset = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/members${this.#GenerateParameters({ n, offset })}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a LimitedGroup Member.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupMember(groupId = "", userId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/members/${userId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Updates a Group Member.
     * 
     * @returns {Promise<JSON>} 
     */
    async UpdateGroupMember({ groupId = "", userId = "", visibility = "", isSubscribedToAnnouncements = false, managerNotes = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/members/${userId}`, { method: 'PUT', body: this.#GenerateBody({ visibility, isSubscribedToAnnouncements, managerNotes }),headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Kicks a Group Member from the Group. The current user must have the "Remove Group Members" permission.
     * 
     * @returns {Promise<JSON>} 
     */
    async KickGroupMember(groupId = "", userId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/members/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Adds a Role to a Group Member.
     * 
     * @returns {Promise<JSON>} 
     */
    async AddRoleToGroupMember(groupId = "", userId = "", groupRoleId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId || !groupRoleId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/members/${userId}/roles/${groupRoleId}`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Removes a Role from a Group Member.
     * 
     * @returns {Promise<JSON>} 
     */
    async RemoveRoleFromGroupMember(groupId = "", userId = "", groupRoleId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId || !groupRoleId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/members/${userId}/roles/${groupRoleId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a List of all possible/available permissions for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async ListGroupPermissions(groupId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/permissions`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a list of members that have requested to join the Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupJoinRequests(groupId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/requests`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Cancels a request sent to join the group.
     * 
     * @returns {Promise<JSON>} 
     */
    async CancelGroupJoinRequest(groupId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/requests`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Responds to a Group Join Request with Accept/Deny
     * 
     * @returns {Promise<JSON>} 
     */
    async RespondToGroupJoinRequest({ groupId = "", userId = "", action = "" }) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/requests/${userId}`, { method: 'PUT', body: this.#GenerateBody({ action }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a Group Role by ID.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupRoles(groupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/roles`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Create a Group role.
     * 
     * @returns {Promise<JSON>} 
     */
    async CreateGroupRole({ groupId = "", id = "", name = "", description = "", isSelfAssignable = false, permissions = [] } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/roles`, { method: 'POST', body: this.#GenerateBody({ id, name, description, isSelfAssignable, permissions }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Updates a group role by ID.
     * 
     * @returns {Promise<JSON>} 
     */
    async UpdateGroupRole({ groupId = "", groupRoleId = "", name = "", description = "", isSelfAssignable = false, permissions = [], order = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupRoleId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/roles/${groupRoleId}`, { method: 'PUT', body: this.#GenerateBody({ name, description, isSelfAssignable, permissions, order }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes a Group Role by ID and returns the remaining roles.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteGroupRole(groupId = "", groupRoleId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupRoleId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/groups/${groupId}/roles/${groupRoleId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

class InviteApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    /**
     * 
     * Sends an invite to a user. Returns the Notification of type invite that was sent.
     * 
     * @returns {Promise<JSON>} 
     */
    async InviteUser({ userId = "", instanceId = "", messageSlot = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!userId || !instanceId) return { success: false, status: 400 };

        const res = await fetch(`$${this.#APIEndpoint}/invite/${userId}`, { method: 'POST', body: JSON.stringify({ instanceId, messageSlot }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Sends self an invite to an instance.
     * 
     * @returns {Promise<JSON>} 
     */
    async InviteMyselfToInstance(worldId = "", instanceId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };  
        if(!worldId || !instanceId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/invite/myself/to/${worldId}:${instanceId}`, { method: 'POST', headers: this.#GenerateHeaders(true, "application/json") }); // No body data so I don't know why I'm using application/json but the docs specify it.
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Requests an invite from a user. Returns the Notification of type requestInvite that was sent.
     * 
     * @returns {Promise<JSON>} 
     */
    async RequestInvite(userId = "", messageSlot = 0) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!userId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/requestInvite/${userId}`, { method: 'POST', body: JSON.stringify({ messageSlot }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Respond to an invite request by sending a world invite to the requesting user. :notificationId is the ID of the requesting notification.
     * 
     * @returns {Promise<JSON>} 
     */
    async RespondInvite(notificationId = "", responseSlot = 0) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!notificationId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/invite/${notificationId}/response`, { method: 'POST', body: JSON.stringify({ responseSlot }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a list of all the users Invite Messages. Admin Credentials are required to view messages of other users!  
     * 
     * See messageTypes here https://vrchatapi.github.io/docs/api/#get-/message/-userId-/-messageType-.
     * 
     * @returns {Promise<JSON>} 
     */
    async ListInviteMessages(userId = "", messageType = "message") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!userId) userId = this.#userid;

        const res = await fetch(`${this.#APIEndpoint}/message/${userId}/${messageType}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a single Invite Message. This returns the exact same information but less than getInviteMessages. Admin Credentials are required to view messages of other users!  
     * 
     * See messageTypes here https://vrchatapi.github.io/docs/api/#get-/message/-userId-/-messageType-/-slot-.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetInviteMessage({ userId = "", messageType = "message", slot = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!userId) userId = this.#userid;

        const res = await fetch(`${this.#APIEndpoint}/message/${userId}/${messageType}/${slot}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Updates a single Invite Message and then returns a list of all of them. Admin Credentials are required to update messages of other users!  
     * 
     * Updating a message automatically sets the cooldown timer to 60 minutes. Trying to edit a message before the cooldown timer expires results in a 429 "Too Fast Error".
     * 
     * See messageTypes here https://vrchatapi.github.io/docs/api/#put-/message/-userId-/-messageType-/-slot-.
     * 
     * @returns {Promise<JSON>} 
     */
    async UpdateInviteMessage({ userId = "", messageType = "message", slot = 0, message = ""} = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!message) return { success: false, status: 400 };
        if(!userId) userId = this.#userid;

        const res = await fetch(`${this.#APIEndpoint}/message/${userId}/${messageType}/${slot}`, { method: 'PUT', body: JSON.stringify({ message }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Resets a single Invite Message back to its original message, and then returns a list of all of them. Admin Credentials are required to update messages of other users!  
     *
     * Resetting a message respects the rate-limit, so it is not possible to reset within the 60 minutes countdown. Resetting it does however not set the rate-limit to 60 like when editing it. It is possible to edit it right after resetting it. Trying to edit a message before the cooldown timer expires results in a 429 "Too Fast Error".  
     * 
     * See messageTypes here https://vrchatapi.github.io/docs/api/#put-/message/-userId-/-messageType-/-slot-.
     * 
     * @returns {Promise<JSON>} 
     */
    async ResetInviteMessage({ userId = "", messageType = "message", slot = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!userId) userId = this.#userid;

        const res = await fetch(`${this.#APIEndpoint}/message/${userId}/${messageType}/${slot}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }
}

class InstancesApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    /**
     * 
     * Returns an instance. Please read Instances Tutorial for more information on Instances.  
     * 
     * If an invalid instanceId is provided, this endpoint will simply return "null"!
     * 
     * @returns {Promise<JSON>} 
     */
    async GetInstance(worldId = "", instanceId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!worldId || !instanceId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/instances/${worldId}:${instanceId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns an instance short name.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetInstanceShortName(worldId = "", instanceId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!worldId || !instanceId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/instances/${worldId}:${instanceId}/shortName`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Sends an invite to the instance to yourself.
     * 
     * @returns {Promise<JSON>} 
     */
    async SendSelfInvite(worldId = "", instanceId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!worldId || !instanceId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/invite/myself/to/${worldId}:${instanceId}`, { method: 'POST', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns an instance.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetInstanceByShortName(shortName = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!shortName) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/instances/s/${shortName}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

class NotificationsApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    #GenerateParameters(params = {}) {
        var paramString = "";
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value) return;
            if(key === "n" && value === 60) return; // Omit n parameter if equal to 60 as it is the default value.
            
            if(paramString) {
                paramString += `&${key}=${value}`;
                return;
            }

            paramString += `${key}=${value}`;
        });
        return paramString;
    }

    /**
     * 
     * Retrieve all of the current user's notifications.
     *  
     * @returns {Promise<JSON>}
     */
    async ListNotifications({ hidden = false, after = "", n = 60, offset = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const params = this.#GenerateParameters({ hidden, after, n, offset });
        const res = await fetch(`${this.#APIEndpoint}/auth/user/notifications${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Accept a friend request by notification frq_ ID. Friend requests can be found using the NotificationsAPI getNotifications by filtering of type friendRequest.
     *  
     * @returns {Promise<JSON>}
     */
    async AcceptFriendRequest(notificationId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!notificationId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/auth/user/notifications/${notificationId}/accept`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Mark a notification as seen.
     *  
     * @returns {Promise<JSON>}
     */
    async MarkNotificationAsRead(notificationId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!notificationId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/auth/user/notifications/${notificationId}/see`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Delete a notification.
     *  
     * @returns {Promise<JSON>}
     */
    async DeleteNotification(notificationId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!notificationId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/auth/user/notifications/${notificationId}/hide`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Clear **all** notifications.
     *  
     * @returns {Promise<JSON>}
     */
    async ClearAllNotifications() {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/auth/user/notifications/clear`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

class PermissionsApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    /**
     * 
     * Returns a list of all permissions currently granted by the user. Permissions are assigned e.g. by subscribing to VRC+.
     * 
     * @returns {Promise<JSON>}
     */
    async GetAssignedPermissions() {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/auth/permissions`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a single permission. This endpoint is pretty useless, as it returns the exact same information as /auth/permissions.
     * 
     * @returns {Promise<JSON>}
     */
    async GetPermission(permissionId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!permissionId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/permissions/${permissionId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

class PlayerModerationApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    #GenerateParameters(params = {}) {
        var paramString = "";
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value) return;
            if(key === "n" && value === 60) return; // Omit n parameter if equal to 60 as it is the default value.
            
            if(paramString) {
                paramString += `&${key}=${value}`;
                return;
            }

            paramString += `${key}=${value}`;
        });
        return paramString;
    }

    /**
     * 
     * Returns a list of all player moderations made by **you**.  
     * 
     * This endpoint does not have pagination, and will return ***all*** results. Use query parameters to limit your query if needed.
     * @returns {Promise<JSON>}
     */
    async SearchPlayerModerations({ type = "", targetUserId = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        
        const params = this.#GenerateParameters({ type, targetUserId });
        const res = await fetch(`${this.#APIEndpoint}/auth/user/playermoderations${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Moderate a user, e.g. unmute them or show their avatar.  
     * 
     * Please see the [Player Moderation docs](https://vrchatapi.github.io/docs/api/#tag--playermoderation) on what playerModerations are, and how they differ from staff moderations.
     * @returns {Promise<JSON>}
     */
    async ModerateUser(moderated = "", type = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!moderated || !type) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/auth/user/playermoderations`, { method: 'POST', body: JSON.stringify({ moderated, type }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * **This will delete every single player moderation you've ever made.**
     * 
     * @returns {Promise<JSON>}
     */
    async ClearAllPlayerModerations() {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/auth/user/playermoderations`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a single Player Moderation. This returns the exact same amount of information as the more generalised getPlayerModerations.
     * 
     * @returns {Promise<JSON>}
     */
    async GetPlayerModeration(playerModerationId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!playerModerationId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/auth/user/playermoderations/${playerModerationId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes a specific player moderation based on it's pmod_ ID. The website uses unmoderateUser instead. You can delete the same player moderation multiple times successfully.
     * 
     * @returns {Promise<JSON>}
     */
    async DeletePlayerModeration(playerModerationId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!playerModerationId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/auth/user/playermoderations/${playerModerationId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Removes a player moderation previously added through moderateUser. E.g if you previously have shown their avatar, but now want to reset it to default.
     * 
     * @returns {Promise<JSON>}
     */
    async UnModerateUser(moderated = "", type = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!moderated || !type) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/auth/user/unplayermoderate`, { method: 'PUT', body: JSON.stringify({ moderated, type }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

class SystemApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    constructor() {

    }

    #GenerateParameters(params = {}) {
        var paramString = "";
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value) return;
            if(key === "n" && value === 60) return; // Omit n parameter if equal to 60 as it is the default value.
            
            if(paramString) {
                paramString += `&${key}=${value}`;
                return;
            }

            paramString += `${key}=${value}`;
        });
        return paramString;
    }

    /**
     * 
     * API config contains configuration that the clients needs to work properly.
     * 
     * @returns {Promise<JSON>}
     */
    async FetchAPIConfig() {

        const res = await fetch(`${this.#APIEndpoint}/config`);
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * **EARLY ACCESS**
     * 
     * IPS (Info Push System) is a system for VRChat to push out dynamic information to the client. This is primarily used by the Quick-Menu info banners, but can also be used to e.g. alert you to update your game to the latest version.  

     * include is used to query what Information Pushes should be included in the response. If include is missing or empty, then no notices will normally be returned. This is an "any of" search.  

     * require is used to limit what Information Pushes should be included in the response. This is usually used in combination with include, and is an "all of" search.
     * 
     * @returns {Promise<JSON>}
     */
    async ShowInformationNotices({ require = "", include = "" } = {}) {

        const params = this.#GenerateParameters({ require, include });
        const res = await fetch(`${this.#APIEndpoint}/infoPush${params ? "?" + params : ""}`);
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Fetches the CSS code to the frontend React website.
     * 
     * @returns {Promise<JSON>}
     */
    async DownloadCSS(variant = "public", branch = "main") {

        const params = this.#GenerateParameters({ variant, branch });
        const res = await fetch(`${this.#APIEndpoint}/css/app.css${params ? "?" + params : ""}`);
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: { css: await res.json() } };
    }

    /**
     * 
     * Fetches the JavaScript code to the frontend React website.
     * 
     * @returns {Promise<JSON>}
     */
    async DownloadJavaScript(variant = "public", branch = "main") {

        const params = this.#GenerateParameters({ variant, branch });
        const res = await fetch(`${this.#APIEndpoint}/js/app.js${params ? "?" + params : ""}`);
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: { javascript: await res.json().toString() } };
    }

    /**
     * 
     * Returns the current number of online users.
     * 
     * @returns {Promise<JSON>}
     */
    async CurrentOnlineUsers() {

        const res = await fetch(`${this.#APIEndpoint}/visits`);
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: { users: await res.json() } };
    }

    /**
     * 
     * Returns the current time of the API server.
     * 
     * @returns {Promise<JSON>}
     */
    async CurrentSystemTime() {

        const res = await fetch(`${this.#APIEndpoint}/time`);
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: { time: await res.json() } };
    }
}

class UsersApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    /**
     * 
     * Searches for users by displayname.
     * 
     * @returns {Promise<JSON>} Queries for users and returns user object.
     */
    async SearchAllUsers({ displayName = "", returnAmount = 1, offset = 0 } = {}) {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };
        if(!displayName.length > 0) throw Error("Missing argument displayName.");

        const res = await fetch(`${this.#APIEndpoint}/users?search=${displayName}${returnAmount > 0 && returnAmount < 100 ? "&n=" + returnAmount : ""}${offset > 0 ? "&offset" + offset : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, json: await res.json() };
    }

    /**
     * 
     * Gets user object from userid.
     * 
     * @returns {Promise<JSON>} Returns JSON object of current user.
     */
    async GetUserById(userid = "") {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };
        if(!userid.length > 0) throw Error("Missing argument userid.");

        const res = await fetch(`${this.#APIEndpoint}/users/${userid}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, json: await res.json() };
    }

    /**
     * 
     * Updates current user information such as bio and status etc.
     * 
     * @returns {Promise<JSON>} Returns updated user JSON object.
     */
    async UpdateUserInfo({email = "", birthday = "", tags = [], status = "", statusDescription = "", bio = "", bioLinks = []} = {}) {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };
        if(!email && !birthday && !tags && !status && !statusDescription && !bio && !bioLinks) throw Error("Missing argument userInfo JSON.");

        tags.length > 0 ? tags : tags = false;
        bioLinks.length > 0 ? bioLinks : bioLinks = false;

        var userInfoJSON = {};
        const userArgsArr = [email, birthday, tags, status, statusDescription, bio, bioLinks];
        for(var i = 0; i < userArgsArr.length; i++) {
            if(userArgsArr[i]) userInfoJSON[["email", "birthday", "tags", "status", "statusDescription", "bio", "bioLinks"][i]] = `${userArgsArr[i]}`;
        }

        const res = await fetch(`${this.#APIEndpoint}/users/${this.#userid}`, { method: "PUT", headers: this.#GenerateHeaders(true, "application/json"), body: JSON.stringify(userInfoJSON) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, user: await res.json() };
    }

    /**
     * 
     * Gets current users groups.
     * 
     * @returns {Promise<JSON>} Returns JSON array of current users groups.
     */
    async GetUserGroups() {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/users/${this.#userid}/groups`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, groups: await res.json() };
    }

    /**
     * 
     * Gets current user group requests.
     * 
     * @returns {Promise<JSON>} Returns JSON array of current users group requests.
     */
    async GetUserGroupRequests() {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/users/${this.#userid}/groups/requested`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, groups: await res.json() };
    }

}

class WorldsApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}) {
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
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    #GenerateParameters(params = {}) {
        var paramString = "";
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value) return;
            if(value === QuerySort) return;
            if(value === QueryOrder) return;
            if(value === QueryReleaseStatus) return;

            if(key === "n" && value === 60) return; // Omit n parameter if equal to 60 as it is the default value.
            if(key === "user" && value === true) value = "me";
            if(key === "sort" && value instanceof QuerySort) value = value.type;
            if(key === "order" && value instanceof QueryOrder) value = value.type;
            if(key === "releaseStatus" && value instanceof QueryReleaseStatus) value = value.type;
            
            if(paramString) {
                paramString += `&${key}=${value}`;
                return;
            }

            paramString += `${key}=${value}`;
        });
        return paramString;
    }

    /**
     * 
     * Search and list any worlds by query filters.
     * 
     * @returns {Promise<JSON>}
     */
    async SearchAllWorlds({ featured = false, sort = QuerySort, user = false, userId = "", n = 60, order = QueryOrder, offset = 0, search = "", tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        
        const params = this.#GenerateParameters({ featured, sort, user, userId, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform });
        const res = await fetch(`${this.#APIEndpoint}/worlds${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Create a new world. This endpoint requires assetUrl to be a valid File object with .vrcw file extension, and imageUrl to be a valid File object with an image file extension.
     * 
     * @returns {Promise<JSON>}
     */
    async CreateWorld({ assetUrl = "", assetVersion = 0, authorId = "", authorName = "", capacity = 0, description = "", id = "", imageUrl = "", name = "", platform = "", releaseStatus = QueryReleaseStatus, tags = [], unityPackageUrl = "", unityVersion = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!assetUrl || !imageUrl || !name) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/worlds`, { method: 'POST', body: JSON.stringify({ assetUrl, assetVersion, authorId, authorName, capacity, description, id, imageUrl, name, platform, releaseStatus, tags, unityPackageUrl, unityVersion }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }
    
    /**
     * 
     * Search and list currently active worlds by query filters.
     * 
     * @returns {Promise<JSON>}
    */
    async ListActiveWorlds({ featured = false, sort = QuerySort, n = 60, order = QueryOrder, offset = 0, search = "", tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "", userId = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        
        const params = this.#GenerateParameters({ featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId });
        const res = await fetch(`${this.#APIEndpoint}/worlds/active${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };
    
        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Search and list favorited worlds by query filters.
     * 
     * @returns {Promise<JSON>}
     */
    async ListFavoritedWorlds({ featured = false, sort = QuerySort, n = 60, order = QueryOrder, offset = 0, search = "", tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "", userId = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const params = this.#GenerateParameters({ featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId });
        const res = await fetch(`${this.#APIEndpoint}/worlds/favorites${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Search and list recently visited worlds by query filters.
     * 
     * @returns {Promise<JSON>}
     */
    async ListRecentWorlds({ featured = false, sort = QuerySort, n = 60, order = QueryOrder, offset = 0, search = "", tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "", userId = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const params = this.#GenerateParameters({ featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId });
        const res = await fetch(`${this.#APIEndpoint}/worlds/recent${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Get information about a specific World. Works unauthenticated but when so will always return 0 for certain fields.
     * 
     * @returns {Promise<JSON>}
     */
    async GetWorldById(worldId = "") {
        if(!worldId) return { success: false, status: 400 };

        const headers = this.#authCookie ? this.#GenerateHeaders(true) : this.#GenerateHeaders(); // Use authenticated over unauthenticated, but no auth still works just returns 0 in some fields.
        const res = await fetch(`${this.#APIEndpoint}/worlds/${worldId}`, { headers: headers });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Update information about a specific World.
     * 
     * @returns {Promise<JSON>}
     */
    async UpdateWorld({ assetUrl = "", assetVersion = 0, authorId = "", authorName = "", capacity = 0, description = "", id = "", imageUrl = "", name = "", platform = "", releaseStatus = QueryReleaseStatus, tags = [], unityPackageUrl = "", unityVersion = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!id) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/worlds/${id}`, { method: 'PUT', body: JSON.stringify({ assetUrl, assetVersion, authorId, authorName, capacity, description, id, imageUrl, name, platform, releaseStatus, tags, unityPackageUrl, unityVersion }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Delete a world. Notice a world is never fully "deleted", only its ReleaseStatus is set to "hidden" and the linked Files are deleted. The WorldID is permanently reserved.
     * 
     * @returns {Promise<JSON>}
     */
    async DeleteWorld(worldId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!worldId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/worlds/${worldId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a worlds publish status.
     * 
     * @returns {Promise<JSON>}
     */
    async GetWorldPublishStatus(worldId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!worldId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/worlds/${worldId}/publish`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Publish a world. You can only publish one world per week.
     * 
     * @returns {Promise<JSON>}
     */
    async PublishWorld(worldId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!worldId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/worlds/${worldId}/publish`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Unpublish a world. This does not delete a world, only makes it "private".
     * 
     * @returns {Promise<JSON>}
     */
    async UnpublishWorld(worldId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!worldId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/worlds/${worldId}/publish`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a worlds instance.
     * 
     * @returns {Promise<JSON>}
     */
    async GetWorldInstance(worldId = "", instanceId = "") {
        if(!this.#authCookie) return { success: false, status: 401 }
        if(!worldId || !instanceId) return { success: false, status: 400 };

        const res = await fetch(`${this.#APIEndpoint}/worlds/${worldId}/${instanceId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

class VRChat {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

    EventsApi = new EventsApi();
    AuthenticationApi = new AuthenticationApi();
    AvatarsApi = new AvatarsApi();
    EconomyApi = new EconomyApi();
    FavoritesApi = new FavoritesApi();
    FilesApi = new FilesApi();
    FriendsApi = new FriendsApi();
    GroupsApi = new GroupsApi();
    InviteApi = new InviteApi();
    InstancesApi = new InstancesApi();
    NotificationsApi = new NotificationsApi();
    PermissionsApi = new PermissionsApi();
    PlayerModerationApi = new PlayerModerationApi();
    SystemApi = new SystemApi();
    UsersApi = new UsersApi();
    WorldsApi = new WorldsApi();

    constructor(debug = false) {
        this.#debug = debug;
    }

    #Debug(x) {
        if(!this.#debug === true) return;
        console.log(x);
    }

    #GenerateHeaders(authentication = false, contentType = "") {
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.2.0 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    /**
     * 
     * Takes user details and internally creates new session or uses existing session for later ease of use.
     * For more information check the community vrchat api docs, this node library is built to the specifications here. https://vrchatapi.github.io/docs/api/
     * 
     * @returns {Promise<JSON>} Returns JSON object with authentication details and user object.
     */
    async Authenticate({username = "", password = "", authCookie = "", twoFactorAuth = ""} = {}, twoFactorCallback) {
        if((!username.length > 0 || !password.length > 0) && (!authCookie.length > 0)) return false;

        const user = await this.AuthenticationApi.Login({ username: username, password: password, authCookie: authCookie, twoFactorAuth: twoFactorAuth });

        if(!user.success) {
            if(!user.json) return user;
            if(!user.json.requiresTwoFactorAuth) return user;
            if(!twoFactorCallback || typeof(twoFactorCallback) !== "function") return user; // bad failures <^^^ :(

            const code = await twoFactorCallback(user.json["requiresTwoFactorAuth"]);

            if(user.json.requiresTwoFactorAuth[0].toLowerCase() === 'emailotp') {
                if(!code || !code.length > 0) return user;

                const twoFactor = await this.AuthenticationApi.verifyEmailOtp(user.authCookie, code);
                this.#Debug(twoFactor);
                if(!twoFactor.success) return user;

                const auth = await this.Authenticate({
                    authCookie: user.authCookie,
                    twoFactorAuth: twoFactor.twoFactorAuth
                });
                return auth;
            }

            if(user.json.requiresTwoFactorAuth[0].toLowerCase() === 'totp') {
                if(!code || !code.length > 0) return user;

                const twoFactor = await this.AuthenticationApi.verifyTotp(user.authCookie, code);
                if(!twoFactor.success) return user;

                const auth = await this.Authenticate({
                    authCookie: user.authCookie,
                    twoFactorAuth: twoFactor.twoFactorAuth
                });
                return auth;
            }

            if(user.json.requiresTwoFactorAuth[0].toLowerCase() === 'otp') {
                if(!code || !code.length > 0) return user;

                const twoFactor = await this.AuthenticationApi.verifyOtp(user.authCookie, code);
                if(!twoFactor.success) return user;

                const auth = await this.Authenticate({
                    authCookie: user.authCookie,
                    twoFactorAuth: twoFactor.twoFactorAuth
                });
                return auth;
            }
        }

        this.#userid = user.json.id;
        this.#authCookie = user.authCookie;
        this.#twoFactorAuth = user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "";

        this.EventsApi = new EventsApi({ userid: user.json.id,authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.AuthenticationApi = new AuthenticationApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.AvatarsApi = new AvatarsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.EconomyApi = new EconomyApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.FavoritesApi = new FavoritesApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.FilesApi = new FilesApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.FriendsApi = new FriendsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.GroupsApi = new GroupsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.InviteApi = new InviteApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.InstancesApi = new InstancesApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.NotificationsApi = new NotificationsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.PermissionsApi = new PermissionsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.PlayerModerationApi = new PlayerModerationApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.UsersApi = new UsersApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });
        this.WorldsApi = new WorldsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: user["twoFactorAuth"] ? user.twoFactorAuth : twoFactorAuth ? twoFactorAuth : "", debug: this.#debug });

        return user; // success :)
    }

    /**
     * 
     * Clears internal cache and objects of authentication details.
     * 
     * @returns {JSON} Returns JSON object indicating whether de-authentication operation was successful.
     */
    Deauthenticate() {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };

        this.#userid = "";
        this.#authCookie = "";
        this.#twoFactorAuth = "";

        this.EventsApi = new EventsApi();
        this.AuthenticationApi = new AuthenticationApi();
        this.AvatarsApi = new AvatarsApi();
        this.EconomyApi = new EconomyApi();
        this.FavoritesApi = new FavoritesApi();
        this.FilesApi = new FilesApi();
        this.FriendsApi = new FriendsApi();
        this.GroupsApi = new GroupsApi();
        this.InviteApi = new InviteApi();
        this.InstancesApi = new InstancesApi();
        this.NotificationsApi = new NotificationsApi();
        this.PermissionsApi = new PermissionsApi();
        this.PlayerModerationApi = new PlayerModerationApi();
        this.UsersApi = new UsersApi();
        this.WorldsApi = new WorldsApi();

        return { success: true };
    }
};

module.exports = { VRChat, EventsApi, AuthenticationApi, AvatarsApi, EconomyApi, FavoritesApi, FilesApi, FriendsApi, GroupsApi, InviteApi, InstancesApi, NotificationsApi, PermissionsApi, PlayerModerationApi, SystemApi, UsersApi, WorldsApi, Enums };