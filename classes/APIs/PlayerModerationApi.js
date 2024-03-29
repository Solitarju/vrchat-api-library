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
     * **Please read the [Player Moderation Implementation Details](https://vrchatapi.github.io/docs/api/#tag--playermoderation--implementation-details) before modifying player moderations!**
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
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        
        const params = this.#GenerateParameters({ type, targetUserId });
        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);

        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new PlayerModeration(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * **Please read the [Player Moderation Implementation Details](https://vrchatapi.github.io/docs/api/#tag--playermoderation--implementation-details) before modifying player moderations!**
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
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!moderated || !type) throw new Error("Required Argument(s): moderated, type", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations`, { method: 'POST', body: JSON.stringify({ moderated, type }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();
        
        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new PlayerModeration(json);
    }

    /**
     * 
     * **Please read the [Player Moderation Implementation Details](https://vrchatapi.github.io/docs/api/#tag--playermoderation--implementation-details) before modifying player moderations!**
     * 
     * **This will delete every single player moderation you've ever made.**
     * 
     * @returns {Promise<Success>} Returns a single Success object.
     */
    async ClearAllPlayerModerations() {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

    /**
     * 
     * **Please read the [Player Moderation Implementation Details](https://vrchatapi.github.io/docs/api/#tag--playermoderation--implementation-details) before modifying player moderations!**
     * 
     * Returns a single Player Moderation. This returns the exact same amount of information as the more generalised getPlayerModerations.
     * 
     * @param {string} playerModerationId
     * 
     * @returns {Promise<PlayerModeration>} Returns a single PlayerModeration object.
     */
    async GetPlayerModeration(playerModerationId) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!playerModerationId) throw new Error("Required Argument(s): playerModerationId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations/${playerModerationId}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new PlayerModeration(json);
    }

    /**
     * 
     * **Please read the [Player Moderation Implementation Details](https://vrchatapi.github.io/docs/api/#tag--playermoderation--implementation-details) before modifying player moderations!**
     * 
     * Deletes a specific player moderation based on it's pmod_ ID. The website uses unmoderateUser instead. You can delete the same player moderation multiple times successfully.
     * 
     * @param {string} playerModerationId
     * 
     * @returns {Promise<Success>} Returns a single Success object.
     */
    async DeletePlayerModeration(playerModerationId) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!playerModerationId) throw new Error("Required Argument(s): playerModerationId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/playermoderations/${playerModerationId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

    /**
     * 
     * **Please read the [Player Moderation Implementation Details](https://vrchatapi.github.io/docs/api/#tag--playermoderation--implementation-details) before modifying player moderations!**
     * 
     * Removes a player moderation previously added through moderateUser. E.g if you previously have shown their avatar, but now want to reset it to default.
     * 
     * @param {string} moderated
     * @param {string} type
     * 
     * @returns {Promise<Success>} Returns a single Success object.
     */
    async UnModerateUser(moderated, type) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!moderated || !type) throw new Error("Required Argument(s): moderated, type", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/unplayermoderate`, { method: 'PUT', body: JSON.stringify({ moderated, type }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();
        
        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

}

module.exports = { PlayerModerationApi };