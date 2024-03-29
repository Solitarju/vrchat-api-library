const { Notification } = require('../Notification.js');
const { Success } = require('../Success.js');
const { Error } = require('../Error.js');
const Util = require('../Util.js');

class NotificationsApi {

    #fetch;
    #UserAgent;

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

    #GenerateParameters;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}, fetch, UserAgent) {
        this.#fetch = fetch;
        this.#UserAgent = UserAgent;
        this.#GenerateParameters = Util.GenerateParameters;
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
     * Retrieve all of the current user's notifications.
     *  
     * @returns {Promise<Notification>} Returns an array of Notification objects.
     */
    async ListNotifications({ hidden = false, after = "", n = 60, offset = 0 } = {}) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});

        const params = this.#GenerateParameters({ hidden, after, n, offset });
        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/notifications${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);

        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new Notification(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Accept a friend request by notification frq_ ID. Friend requests can be found using the NotificationsAPI getNotifications by filtering of type friendRequest.
     *  
     * @returns {Promise<Success>} Returns a single Success object.
     */
    async AcceptFriendRequest(notificationId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!notificationId) throw new Error("Required Argument: notificationId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/notifications/${notificationId}/accept`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

    /**
     * 
     * Mark a notification as seen.
     *  
     * @returns {Promise<Notification>} Returns a single Notification object.
     */
    async MarkNotificationAsRead(notificationId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!notificationId) throw new Error("Required Argument: notificationId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/notifications/${notificationId}/see`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Notification(json);
    }

    /**
     * 
     * Delete a notification.
     *  
     * @returns {Promise<Notification>} Returns a single Notification object.
     */
    async DeleteNotification(notificationId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!notificationId) throw new Error("Required Argument: notificationId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/notifications/${notificationId}/hide`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Notification(json);
    }

    /**
     * 
     * Clear **all** notifications.
     *  
     * @returns {Promise<Success>} Returns a single success object.
     */
    async ClearAllNotifications() {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/notifications/clear`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

}

module.exports = { NotificationsApi };