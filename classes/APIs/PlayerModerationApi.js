const { PlayerModeration } = require('../PlayerModeration.js');
const { Success } = require('../Success.js');
const { Error } = require('../Error.js');
const Util = require('../Util.js');

class PlayerModerationApi {

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
     * Returns a list of all player moderations made by **you**.  
     * 
     * This endpoint does not have pagination, and will return ***all*** results. Use query parameters to limit your query if needed.
     * 
     * @param {Object} [json={}] 
     * @param {string} [json.type=""] 
     * @param {string} [json.targetUserId=""] 
     * 
     * @returns {Promise<Array<PlayerModeration>>} Returns an array of PlayerModeration objects.
     */
    async SearchPlayerModerations({type, targetUserId} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        
        const params = this.#GenerateParameters({ type, targetUserId });
        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new PlayerModeration(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Moderate a user, e.g. unmute them or show their avatar.  
     * 
     * Please see the [Player Moderation docs](https://vrchatapi.github.io/docs/api/#tag--playermoderation) on what playerModerations are, and how they differ from staff moderations.
     * 
     * @param {string} moderated
     * @param {string} type
     * 
     * @returns {Promise<PlayerModeration>} Returns a single PlayerModeration object.
     */
    async ModerateUser(moderated, type) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!moderated || !type) return new Error("Required Argument(s): moderated, type", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations`, { method: 'POST', body: JSON.stringify({ moderated, type }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();
        
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new PlayerModeration(json);
    }

    /**
     * 
     * **This will delete every single player moderation you've ever made.**
     * 
     * @returns {Promise<Success>} Returns a single Success object.
     */
    async ClearAllPlayerModerations() {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

    /**
     * 
     * Returns a single Player Moderation. This returns the exact same amount of information as the more generalised getPlayerModerations.
     * 
     * @param {string} playerModerationId
     * 
     * @returns {Promise<PlayerModeration>} Returns a single PlayerModeration object.
     */
    async GetPlayerModeration(playerModerationId) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!playerModerationId) return new Error("Required Argument(s): playerModerationId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations/${playerModerationId}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new PlayerModeration(json);
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