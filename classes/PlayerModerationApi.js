class PlayerModerationApi {

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
        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations`, { method: 'POST', body: JSON.stringify({ moderated, type }), headers: this.#GenerateHeaders(true, "application/json") });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations/${playerModerationId}`, { headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations/${playerModerationId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/unplayermoderate`, { method: 'PUT', body: JSON.stringify({ moderated, type }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

module.exports = { PlayerModerationApi };