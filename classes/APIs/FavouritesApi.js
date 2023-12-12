const { Favorite } = require('../Favorite.js');
const { Error } = require('../Error.js');
const Util = require('../Util.js');

class FavoritesApi {

    #fetch;
    #UserAgent;

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

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
     * Returns a list of favorites.
     * 
     * @returns {Promise<Array<Favorite>|Error>} Returns an array of favorite objects.
     */
    async ListFavorites({ n= 60, offset = 0, type = "", tag = "" } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const params = this.#GenerateParameters({ n, offset, type, tag });
        const res = await this.#fetch(`${this.#APIEndpoint}/favorites${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        let returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new Favorite(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Add a new favorite, friend groups are named group_0 through group_3 while Avatar and World groups are named avatars1 to avatars4 and worlds1 to worlds4.
     * 
     * @returns {Promise<Favorite|Error>} Returns a single Favorite object.
     */
    async AddFavorite({ type = "", favoriteId = "", tags = [] } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!type || !favoriteId || tags.length < 1) return new Error("Missing Argument(s): type, favoriteId or tags", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/favorites`, { method: 'POST', body: JSON.stringify({ type, favoriteId, tags }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Favorite(json);
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

        const res = await this.#fetch(`${this.#APIEndpoint}/favorites/${favoriteId}`, { headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/favorites/${favoriteId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
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
        const res = await this.#fetch(`${this.#APIEndpoint}/favorite/groups${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/favorite/group/${favoriteGroupType}/${favoriteGroupName}/${userId}`, { headers: this.#GenerateHeaders(true) });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/favorite/group/${favoriteGroupType}/${favoriteGroupName}/${userId}`, { method: 'PUT', body: JSON.stringify(params), headers: this.#GenerateHeaders(true, "application/json") });
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

        const res = await this.#fetch(`${this.#APIEndpoint}/favorite/group/${favoriteGroupType}/${favoriteGroupName}/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

module.exports = { FavoritesApi };