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

/* 
    The way I wrote this code changed over the period I was writing this, so the code isn't consistent the whole way through, 
    I will update it so it's all consistent and easier to read.
*/

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
            "User-Agent": "node-vrchat-api/1.0.6 contact@solitarju.uk",
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

        this.#WebsocketClient = new WebSocket(`wss://vrchat.com/?authToken=${this.#authCookie}`, { headers: { "cookie": `auth=${this.#authCookie};${this.#twoFactorAuth ? " " + "twoFactorAuth=" + this.#twoFactorAuth + ";" : ""}`, "user-agent": "node-vrchat-api/1.0.6 contact@solitarju.uk" } });

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
            "User-Agent": "node-vrchat-api/1.0.6 contact@solitarju.uk",
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
    }

    #Debug(x) {
        if(!this.#debug === true) return;
        console.log(x);
    }

    #GenerateHeaders(authentication = false, contentType = "") {
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.0.6 contact@solitarju.uk",
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    /**
     * 
     *  Searches for users by displayname.
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
     * @returns {Promise<JSON>}
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
     * @returns {Promise<JSON>}
     */
    async GetUserGroupRequests() {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };

        const res = await fetch(`${this.#APIEndpoint}/users/${this.#userid}/groups/requested`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, groups: await res.json() };
    }

}

class Vrchat {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

    Events = new EventsApi();
    Authentication = new AuthenticationApi();
    Users = new UsersApi();

    constructor(debug = false) {
        this.#debug = debug;
    }

    #Debug(x) {
        if(!this.#debug === true) return;
        console.log(x);
    }

    #GenerateHeaders(authentication = false, contentType = "") {
        var headers = new fetch.Headers({
            "User-Agent": "node-vrchat-api/1.0.6 contact@solitarju.uk",
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

        const user = await this.Authentication.Login({ username: username, password: password, authCookie: authCookie, twoFactorAuth: twoFactorAuth });

        if(!user.success) {
            if(!user.json) return user;
            if(!user.json.requiresTwoFactorAuth) return user;
            if(!twoFactorCallback || typeof(twoFactorCallback) !== "function") return user; // bad failures <^^^ :(

            const code = await twoFactorCallback(user.json["requiresTwoFactorAuth"]);

            if(user.json.requiresTwoFactorAuth[0].toLowerCase() === 'emailotp') {
                if(!code || !code.length > 0) return user;

                const twoFactor = await this.Authentication.verifyEmailOtp(user.authCookie, code);
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

                const twoFactor = await this.Authentication.verifyTotp(user.authCookie, code);
                if(!twoFactor.success) return user;

                const auth = await this.Authenticate({
                    authCookie: user.authCookie,
                    twoFactorAuth: twoFactor.twoFactorAuth
                });
                return auth;
            }

            if(user.json.requiresTwoFactorAuth[0].toLowerCase() === 'otp') {
                if(!code || !code.length > 0) return user;

                const twoFactor = await this.Authentication.verifyOtp(user.authCookie, code);
                if(!twoFactor.success) return user;

                const auth = await this.Authenticate({
                    authCookie: user.authCookie,
                    twoFactorAuth: twoFactor.twoFactorAuth
                });
                return auth;
            }
        }

        this.#userid = user.json.id;
        this.#authCookie = authCookie;
        this.#twoFactorAuth = twoFactorAuth;

        this.Events = new EventsApi({ userid: user.json.id,authCookie: authCookie, twoFactorAuth: twoFactorAuth, debug: this.#debug });
        this.Authentication = new AuthenticationApi({ userid: user.json.id, authCookie: authCookie, twoFactorAuth: twoFactorAuth, debug: this.#debug });
        this.Users = new UsersApi({ userid: user.json.id, authCookie: authCookie, twoFactorAuth: twoFactorAuth, debug: this.#debug });

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

        this.Events = new EventsApi();
        this.Authentication = new AuthenticationApi();
        this.Users = new UsersApi();

        return { success: true };
    }
}

exports.Vrchat = Vrchat;
exports.EventType = EventType;
exports.EventsApi = EventsApi;
exports.AuthenticationApi = AuthenticationApi;
exports.UsersApi = UsersApi;