class FriendsApi {

    #fetch;
    #UserAgent;

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

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
        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/friends${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
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
        
        const res = await this.#fetch(`${this.#APIEndpoint}/user/${userId}/friendRequest`, { method: 'POST', headers: this.#GenerateHeaders(true) });
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
        
        const res = await this.#fetch(`${this.#APIEndpoint}/user/${userId}/friendRequest`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/user/${userId}/friendStatus`, { headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/friends/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }
}

module.exports = { FriendsApi };