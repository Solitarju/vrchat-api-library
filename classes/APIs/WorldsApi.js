const Util = require('../Util.js');
const { QueryReleaseStatus, QuerySort, QueryOrder } = require('./Enums.js');
const { World } = require('../World.js');
const { LimitedWorld } = require('../LimitedWorld.js');
const { WorldPublishStatus } = require('../WorldPublishStatus.js');
const { Instance } = require('../Instance.js');
const { Error } = require('../Error.js');

class WorldsApi {

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
     * Search and list any worlds by query filters.
     * 
     * @returns {Promise<LimitedWorld>}
     */
    async SearchAllWorlds({ featured = false, sort = QuerySort, user = false, userId = "", n = 60, order = QueryOrder, offset = 0, search = "", tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "" } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        
        const params = this.#GenerateParameters({ featured, sort, user, userId, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform });
        const res = await this.#fetch(`${this.#APIEndpoint}/worlds${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new LimitedWorld(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Create a new world. This endpoint requires assetUrl to be a valid File object with .vrcw file extension, and imageUrl to be a valid File object with an image file extension.
     * 
     * @returns {Promise<World>}
     */
    async CreateWorld({ assetUrl = "", assetVersion = 0, authorId = "", authorName = "", capacity = 0, description = "", id = "", imageUrl = "", name = "", platform = "", releaseStatus = QueryReleaseStatus, tags = [], unityPackageUrl = "", unityVersion = "" } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        if(!assetUrl || !imageUrl || !name) return new Error("Missing Argument(s)", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds`, { method: 'POST', body: JSON.stringify({ assetUrl, assetVersion, authorId, authorName, capacity, description, id, imageUrl, name, platform, releaseStatus, tags, unityPackageUrl, unityVersion }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return new World(json);
    }
    
    /**
     * 
     * Search and list currently active worlds by query filters.
     * 
     * @returns {Promise<LimitedWorld>}
    */
    async ListActiveWorlds({ featured = false, sort = QuerySort, n = 60, order = QueryOrder, offset = 0, search = "", tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "", userId = "" } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        
        const params = this.#GenerateParameters({ featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId });
        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/active${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        
        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new LimitedWorld(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Search and list favorited worlds by query filters.
     * 
     * @returns {Promise<LimitedWorld>}
     */
    async ListFavoritedWorlds({ featured = false, sort = QuerySort, n = 60, order = QueryOrder, offset = 0, search = "", tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "", userId = "" } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});

        const params = this.#GenerateParameters({ featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId });
        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/favorites${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new LimitedWorld(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Search and list recently visited worlds by query filters.
     * 
     * @returns {Promise<LimitedWorld}
     */
    async ListRecentWorlds({ featured = false, sort = QuerySort, n = 60, order = QueryOrder, offset = 0, search = "", tag = "", notag = "", releaseStatus = QueryReleaseStatus, maxUnityVersion = "", minUnityVersion = "", platform = "", userId = "" } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});

        const params = this.#GenerateParameters({ featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId });
        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/recent${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new LimitedWorld(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Get information about a specific World. Works unauthenticated but when so will always return 0 for certain fields.
     * 
     * @returns {Promise<World>}
     */
    async GetWorldById(worldId = "") {
        if(!worldId) return new Error("Missing Argument(s)", 400, {});

        const headers = this.#authCookie ? this.#GenerateHeaders(true) : this.#GenerateHeaders(); // Use authenticated over unauthenticated, but no auth still works just returns 0 in some fields.
        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}`, { headers: headers });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return new World(json);
    }

    /**
     * 
     * Update information about a specific World.
     * 
     * @returns {Promise<World>}
     */
    async UpdateWorld({ assetUrl = "", assetVersion = 0, authorId = "", authorName = "", capacity = 0, description = "", id = "", imageUrl = "", name = "", platform = "", releaseStatus = QueryReleaseStatus, tags = [], unityPackageUrl = "", unityVersion = "" } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        if(!id) return new Error("Missing Argument(s)", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${id}`, { method: 'PUT', body: JSON.stringify({ assetUrl, assetVersion, authorId, authorName, capacity, description, id, imageUrl, name, platform, releaseStatus, tags, unityPackageUrl, unityVersion }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return new World(json);
    }

    /**
     * 
     * Delete a world. Notice a world is never fully "deleted", only its ReleaseStatus is set to "hidden" and the linked Files are deleted. The WorldID is permanently reserved.
     * 
     * @returns {Promise<JSON>}
     */
    async DeleteWorld(worldId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        if(!worldId) return new Error("Missing Argument(s)", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return { success: true, res: json };
    }

    /**
     * 
     * Returns a worlds publish status.
     * 
     * @returns {Promise<WorldPublishStatus>}
     */
    async GetWorldPublishStatus(worldId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        if(!worldId) return new Error("Missing Argument(s)", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}/publish`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return new WorldPublishStatus(json);
    }

    /**
     * 
     * Publish a world. You can only publish one world per week.
     * 
     * @returns {Promise<JSON>} ??? Unsure of the response object type.
     */
    async PublishWorld(worldId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        if(!worldId) return new Error("Missing Argument(s)", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}/publish`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return { success: true, res: json };
    }

    /**
     * 
     * Unpublish a world. This does not delete a world, only makes it "private".
     * 
     * @returns {Promise<JSON>}
     */
    async UnpublishWorld(worldId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        if(!worldId) return new Error("Missing Argument(s)", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}/publish`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return { success: true, res: json };
    }

    /**
     * 
     * Returns a worlds instance.
     * 
     * @returns {Promise<Instance>}
     */
    async GetWorldInstance(worldId = "", instanceId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        if(!worldId || !instanceId) return new Error("Missing Argument(s)", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}/${instanceId}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return new Instance(json);
    }

}

module.exports = { WorldsApi };