const { Notification } = require('../Notification.js');
const { SentNotification } = require('../SentNotification.js');
const { Error } = require('../Error.js');

class InviteApi {

    #fetch;
    #UserAgent;

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}, fetch, UserAgent) {
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

    /**
     * 
     * Sends an invite to a user. Returns the Notification of type `invite` that was sent.
     * 
     * @param {Object} [json={}] 
     * @param {string} json.userId
     * @param {string} json.instanceId
     * @param {number} [json.messageSlot=0] 
     * 
     * @returns {Promise<SentNotification>} Returns a single SentNotification object.
     */
    async InviteUser({userId, instanceId, messageSlot} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!userId || !instanceId) return new Error("Required Argument(s): userId, instanceId", 400, {});

        const res = await this.#fetch(`$${this.#APIEndpoint}/invite/${userId}`, { method: 'POST', body: JSON.stringify({ instanceId, messageSlot }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();
        
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new SentNotification(json);
    }

    /**
     * 
     * Sends self an invite to an instance.
     * 
     * @param {string} worldId
     * @param {string} instanceId
     * 
     * @returns {Promise<SentNotification>} Returns a single SentNotification object.
     */
    async InviteMyselfToInstance(worldId, instanceId) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!userId || !instanceId) return new Error("Required Argument(s): userId, instanceId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/invite/myself/to/${worldId}:${instanceId}`, { method: 'POST', headers: this.#GenerateHeaders(true, "application/json") }); // No body data so I don't know why I'm using application/json but the docs specify it.
        const json = await res.json();
        
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new SentNotification(json);
    }

    /**
     * 
     * Requests an invite from a user. Returns the Notification of type requestInvite that was sent.
     * 
     * @param {string} userId
     * @param {number} [messageSlot=0] 
     * 
     * @returns {Promise<Notification>} Returns a single Notification object.
     */
    async RequestInvite(userId, messageSlot) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!userId) return new Error("Required Argument(s): userId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/requestInvite/${userId}`, { method: 'POST', body: JSON.stringify({ messageSlot }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();
        
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Notification(json);
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

        const res = await this.#fetch(`${this.#APIEndpoint}/invite/${notificationId}/response`, { method: 'POST', body: JSON.stringify({ responseSlot }), headers: this.#GenerateHeaders(true, "application/json") });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/message/${userId}/${messageType}`, { headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/message/${userId}/${messageType}/${slot}`, { headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/message/${userId}/${messageType}/${slot}`, { method: 'PUT', body: JSON.stringify({ message }), headers: this.#GenerateHeaders(true, "application/json") });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/message/${userId}/${messageType}/${slot}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }
}

module.exports = { InviteApi };