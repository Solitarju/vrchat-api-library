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
     * @returns {Promise<JSON>}
     */
    async ListNotifications({ hidden = false, after = "", n = 60, offset = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const params = this.#GenerateParameters({ hidden, after, n, offset });
        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/notifications${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/notifications/${notificationId}/accept`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/notifications/${notificationId}/see`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/notifications/${notificationId}/hide`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/notifications/clear`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

module.exports = { NotificationsApi };