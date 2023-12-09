const { Avatar } = require('../Avatar.js');
const { Error } = require('../Error.js');
const { Enums, QueryReleaseStatus, QuerySort, QueryOrder } = require('./Enums.js');
const Util = require('../Util.js');

class AvatarsApi {

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
     * Get the avatar for the current authenticated user.
     * 
     * @returns {Promise<Avatar|Error>} Returns a single Avatar object.
     */
    async GetOwnAvatar() {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/users/${this.#userid}/avatar`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Avatar(json);
    }

    /**
     * 
     * Search and list avatars by query filters. You can only search your own or featured avatars. It is not possible as a normal user to search other peoples avatars.
     * 
     * @returns {Promise<JSON>}
     */
    async SearchAvatars({ featured = false, sort = QuerySort, user = false, userId = "", n = 60, order = QueryOrder, offset = 0, tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "" } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const params = this.#GenerateParameters({ featured, sort, user, userId, n, order, offset, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform });
        const res = await this.#fetch(`${this.#APIEndpoint}/avatars${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Create an avatar. It's possible to optionally specify a ID if you want a custom one. Attempting to create an Avatar with an already claimed ID will result in a DB error.
     * 
     * @returns {Promise<JSON>}
     */
    async CreateAvatar({ assetUrl = "", id = "", name = "", description = "", tags = [], imageUrl = "", releaseStatus = QueryReleaseStatus, version = 1, unityPackageUrl = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await this.#fetch(`${this.#APIEndpoint}/avatars`, { method: 'POST', body: JSON.stringify({ assetUrl: assetUrl, id: id, name: name, description: description, tags: tags, imageUrl: imageUrl, releaseStatus: releaseStatus, version: version, unityPackageUrl: unityPackageUrl }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Get information about a specific Avatar by id.
     * 
     * @returns {Promise<JSON>}
     */
    async GetAvatar(avatarId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!avatarId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/avatars/${avatarId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Update information about a specific avatar.
     * 
     * @returns {Promise<JSON>}
     */
    async UpdateAvatar({ assetUrl = "", id = "", name = "", description = "", tags = [], imageUrl = "", releaseStatus = Enums.QueryReleaseStatus.public, version = 1, unityPackageUrl = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!id) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/avatars/${id}`, { method: 'PUT', body: JSON.stringify({ assetUrl: assetUrl, id: id, name: name, description: description, tags: tags, imageUrl: imageUrl, releaseStatus: releaseStatus, version: version, unityPackageUrl: unityPackageUrl }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Delete an avatar. Notice an avatar is never fully "deleted", only its ReleaseStatus is set to "hidden" and the linked Files are deleted. The AvatarID is permanently reserved.
     * 
     * @returns {Promise<JSON>}
     */
    async DeleteAvatar(avatarId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!avatarId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/avatars/${avatarId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Switches authenticated user into that avatar.
     * 
     * @returns {Promise<JSON>}
     */
    async SelectAvatar(avatarId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!avatarId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/avatars/${avatarId}/select`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Switches authenticated user into that avatar as your fallback avatar.
     * 
     * @returns {Promise<JSON>}
     */
    async SelectFallbackAvatar(avatarId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!avatarId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/avatars/${avatarId}/selectFallback`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Search and list favorited avatars by query filters.
     * 
     * @returns {Promise<JSON>}
     */
    async ListFavoritedAvatars({ featured = true, sort = QuerySort, n = 60, order = QueryOrder, offset = 0, search = "", tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "", userId = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const params = this.#GenerateParameters({ featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId });
        const res = await this.#fetch(`${this.#APIEndpoint}/avatars/favorites${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }
}

module.exports = { AvatarsApi };