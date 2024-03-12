const { Favorite } = require('../Favorite.js');
const { FavoriteGroup } = require('../FavoriteGroup.js');
const { Success } = require('../Success.js');
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
     * @returns {Promise<Array<Favorite>>} Returns an array of favorite objects.
     */
    async ListFavorites({ n= 60, offset = 0, type = "", tag = "" } = {}) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});

        const params = this.#GenerateParameters({ n, offset, type, tag });
        const res = await this.#fetch(`${this.#APIEndpoint}/favorites${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);

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
     * @returns {Promise<Favorite>} Returns a single Favorite object.
     */
    async AddFavorite({ type = "", favoriteId = "", tags = [] } = {}) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!type || !favoriteId || !tags.length > 0) throw new Error("Required Argument(s): type, favoriteId, tags", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/favorites`, { method: 'POST', body: JSON.stringify({ type, favoriteId, tags }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Favorite(json);
    }

    /**
     * 
     * Return information about a specific Favorite.
     * 
     * @returns {Promise<Favorite>} Returns a single Favorite object.
     */
    async ShowFavorite(favoriteId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!favoriteId) throw new Error("Required Argument: favoriteId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/favorites/${favoriteId}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Favorite(json);
    }

    /**
     * 
     * Remove a favorite from your favorites list.
     * 
     * @returns {Promise<Success>} Returns a single Success object.
     */
    async RemoveFavorite(favoriteId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!favoriteId) throw new Error("Required Argument: favoriteId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/favorites/${favoriteId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

    /**
     * 
     * Return a list of favorite groups owned by a user.
     * 
     * @returns {Promise<Array<FavoriteGroup>>} Returns an array of FavoriteGroup objects.
     */
    async ListFavoriteGroups({ n = 60, offset = 0, ownerId = "" } = {}) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});

        const params = this.#GenerateParameters({ n, offset, ownerId });
        const res = await this.#fetch(`${this.#APIEndpoint}/favorite/groups${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);

        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new FavoriteGroup(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Fetch information about a specific favorite group.
     * 
     * @returns {Promise<FavoriteGroup>} Returns a single FavoriteGroup object.
     */
    async ShowFavoriteGroup(favoriteGroupType = "", favoriteGroupName = "", userId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!favoriteGroupType || !favoriteGroupName || !userId) throw new Error("Required Argument(s): favoriteGroupType, favoriteGroupName, userId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/favorite/group/${favoriteGroupType}/${favoriteGroupName}/${userId}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new FavoriteGroup(json);
    }

    /**
     * 
     * Update information about a specific favorite group.
     * 
     * @returns {Promise<Number>} Returns HTTP Status of the request.
     */
    async UpdateFavoriteGroup({ favoriteGroupType = "", favoriteGroupName = "", userId = "", displayName = "", visibility = "", tags = [] } = {}) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!favoriteGroupType || !favoriteGroupName || !userId) throw new Error("Required Argument(s): favoriteGroupType, favoriteGroupName, userId", 400, {});

        let params = {};
        if(displayName) params.displayName = displayName;
        if(visibility) params.visibility = visibility;
        if(tags.length > 0) params.tags = tags;

        const res = await this.#fetch(`${this.#APIEndpoint}/favorite/group/${favoriteGroupType}/${favoriteGroupName}/${userId}`, { method: 'PUT', body: JSON.stringify(params), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return res.status;
    }

    /**
     * 
     * Clear ALL contents of a specific favorite group.
     * 
     * @returns {Promise<Success>} Returns a single Success object.
     */
    async ClearFavoriteGroup(favoriteGroupType = "", favoriteGroupName = "", userId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!favoriteGroupType || !favoriteGroupName || !userId) throw new Error("Required Argument(s): favoriteGroupType, favoriteGroupName, userId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/favorite/group/${favoriteGroupType}/${favoriteGroupName}/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

}

module.exports = { FavoritesApi };