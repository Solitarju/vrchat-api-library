const { QueryReleaseStatus, QuerySort, QueryOrder } = require('./Enums.js');
const { Instance } = require('../Instance.js');
const { World } = require('../World.js');
const { LimitedWorld } = require('../LimitedWorld.js');
const { WorldPublishStatus } = require('../WorldPublishStatus.js');
const { Error } = require('../Error.js');
const Util = require('../Util.js');

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
     * @param {Object} [json={}] 
     * @param {boolean} [json.featured=false] 
     * @param {QuerySort} [json.sort=QuerySort] 
     * @param {boolean} [json.user=false] 
     * @param {string} [json.userId=""] 
     * @param {number} [json.n=60] 
     * @param {QueryOrder} [json.order=QueryOrder] 
     * @param {number} [json.offset=0] 
     * @param {string} [json.search=""] 
     * @param {string} [json.tag=""] 
     * @param {string} [json.notag=""] 
     * @param {QueryReleaseStatus} [json.releaseStatus=QueryReleaseStatus] 
     * @param {string} [json.maxUnityVersion=""] 
     * @param {string} [json.minUnityVersion=""] 
     * @param {string} [json.platform=""] 
     * 
     * @returns {Promise<Array<LimitedWorld>>} Returns an array of LimitedWorld objects.
     */
    async SearchAllWorlds({featured, sort, user, userId, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform} = {}) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        
        const params = this.#GenerateParameters({ featured, sort, user, userId, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform });
        const res = await this.#fetch(`${this.#APIEndpoint}/worlds${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);

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
     * @param {Object} [json={}] 
     * @param {string} [json.assetUrl=""] 
     * @param {number} [json.assetVersion=0] 
     * @param {string} [json.authorId=""] 
     * @param {string} [json.authorName=""] 
     * @param {number} [json.capacity=0] 
     * @param {string} [json.description=""] 
     * @param {string} [json.id=""] 
     * @param {string} [json.imageUrl=""] 
     * @param {string} [json.name=""] 
     * @param {string} [json.platform=""] 
     * @param {QueryReleaseStatus} [json.releaseStatus=QueryReleaseStatus] 
     * @param {string[]} [json.tags=[]] 
     * @param {string} [json.unityPackageUrl=""] 
     * @param {string} [json.unityVersion=""] 
     * 
     * @returns {Promise<World>} Returns a single World object.
     */
    async CreateWorld({assetUrl, assetVersion, authorId, authorName, capacity, description, id, imageUrl, name, platform, releaseStatus, tags, unityPackageUrl, unityVersion} = {}) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!assetUrl || !imageUrl || !name) throw new Error("Required Argument(s): assetUrl, imageUrl, name", 400, {});

        const args = {assetUrl, assetVersion, authorId, authorName, capacity, description, id, imageUrl, name, platform, releaseStatus, tags, unityPackageUrl, unityVersion};
        let bodyJSON = {};
        for(let i = 0; i < 7; i++) {
            let key = Object.keys(args)[i];
            if(args[key] !== undefined) bodyJSON[key] = args[key];
        }

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds`, { method: 'POST', body: JSON.stringify(bodyJSON), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new World(json);
    }
    
    /**
     * 
     * Search and list currently active worlds by query filters.
     * 
     * @param {Object} [json={}] 
     * @param {boolean} [json.featured=false] 
     * @param {QuerySort} [json.sort=QuerySort] 
     * @param {number} [json.n=60] 
     * @param {QueryOrder} [json.order=QueryOrder] 
     * @param {number} [json.offset=0] 
     * @param {string} [json.search=""] 
     * @param {string} [json.tag=""] 
     * @param {string} [json.notag=""] 
     * @param {QueryReleaseStatus} [json.releaseStatus=QueryReleaseStatus] 
     * @param {string} [json.maxUnityVersion=""] 
     * @param {string} [json.minUnityVersion=""] 
     * @param {string} [json.platform=""] 
     * @param {string} [json.userId=""] 
     * 
     * @returns {Promise<Array<LimitedWorld>>} Returns an array of LimitedWorld objects.
    */
    async ListActiveWorlds({featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId} = {}) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        
        const params = this.#GenerateParameters({ featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId });
        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/active${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        
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
     * @param {Object} [json={}] 
     * @param {boolean} [json.featured=false] 
     * @param {QuerySort} [json.sort=QuerySort] 
     * @param {number} [json.n=60] 
     * @param {QueryOrder} [json.order=QueryOrder] 
     * @param {number} [json.offset=0] 
     * @param {string} [json.search=""] 
     * @param {string} [json.tag=""] 
     * @param {string} [json.notag=""] 
     * @param {QueryReleaseStatus} [json.releaseStatus=QueryReleaseStatus] 
     * @param {string} [json.maxUnityVersion=""] 
     * @param {string} [json.minUnityVersion=""] 
     * @param {string} [json.platform=""] 
     * @param {string} [json.userId=""] 
     * 
     * @returns {Promise<Array<LimitedWorld>>} Returns an array of LimitedWorld objects.
     */
    async ListFavoritedWorlds({featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId} = {}) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});

        const params = this.#GenerateParameters({ featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId });
        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/favorites${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);

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
     * @param {Object} [json={}] 
     * @param {boolean} [json.featured=false] 
     * @param {QuerySort} [json.sort=QuerySort] 
     * @param {number} [json.n=60] 
     * @param {QueryOrder} [json.order=QueryOrder] 
     * @param {number} [json.offset=0] 
     * @param {string} [json.search=""] 
     * @param {string} [json.tag=""] 
     * @param {string} [json.notag=""] 
     * @param {QueryReleaseStatus} [json.releaseStatus=QueryReleaseStatus] 
     * @param {string} [json.maxUnityVersion=""] 
     * @param {string} [json.minUnityVersion=""] 
     * @param {string} [json.platform=""] 
     * @param {string} [json.userId=""] 
     * 
     * @returns {Promise<Array<LimitedWorld>>} Returns an array of LimitedWorld objects.
     */
    async ListRecentWorlds({featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId} = {}) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});

        const params = this.#GenerateParameters({ featured, sort, n, order, offset, search, tag, notag, releaseStatus, maxUnityVersion, minUnityVersion, platform, userId });
        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/recent${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);

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
     * @returns {Promise<World>} Returns a single World object.
     */
    async GetWorldById(worldId = "") {
        if(!worldId) throw new Error("Required Argument: worldId", 400, {});

        const headers = this.#authCookie ? this.#GenerateHeaders(true) : this.#GenerateHeaders(); // Use authenticated over unauthenticated, but no auth still works just returns 0 in some fields.
        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}`, { headers: headers });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new World(json);
    }

    /**
     * 
     * Update information about a specific World.
     * 
     * @param {Object} [json={}] 
     * @param {string} [json.assetUrl=""] 
     * @param {number} [json.assetVersion=0] 
     * @param {string} [json.authorId=""] 
     * @param {string} [json.authorName=""] 
     * @param {number} [json.capacity=0] 
     * @param {string} [json.description=""] 
     * @param {string} [json.id=""] 
     * @param {string} [json.imageUrl=""] 
     * @param {string} [json.name=""] 
     * @param {string} [json.platform=""] 
     * @param {QueryReleaseStatus} [json.releaseStatus=QueryReleaseStatus] 
     * @param {string[]} [json.tags=[]] 
     * @param {string} [json.unityPackageUrl=""] 
     * @param {string} [json.unityVersion=""] 
     * 
     * @returns {Promise<World>} Returns a single World object.
     */
    async UpdateWorld({assetUrl, assetVersion, authorId, authorName, capacity, description, id, imageUrl, name, platform, releaseStatus, tags, unityPackageUrl, unityVersion} = {}) {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!id) throw new Error("Required Argument: id", 400, {});

        const args = {assetUrl, assetVersion, authorId, authorName, capacity, description, id, imageUrl, name, platform, releaseStatus, tags, unityPackageUrl, unityVersion};
        let bodyJSON = {};
        for(let i = 0; i < 7; i++) {
            let key = Object.keys(args)[i];
            if(args[key] !== undefined) bodyJSON[key] = args[key];
        }

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${id}`, { method: 'PUT', body: JSON.stringify(bodyJSON), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new World(json);
    }

    /**
     * 
     * Delete a world. Notice a world is never fully "deleted", only its ReleaseStatus is set to "hidden" and the linked Files are deleted. The WorldID is permanently reserved.
     * 
     * @returns {Promise<Number>} Returns HTTP status code.
     */
    async DeleteWorld(worldId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!worldId) throw new Error("Required Argument: worldId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return res.status;
    }

    /**
     * 
     * Returns a worlds publish status.
     * 
     * @returns {Promise<WorldPublishStatus>} Returns a single WorldPublishStatus object.
     */
    async GetWorldPublishStatus(worldId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!worldId) throw new Error("Required Argument: worldId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}/publish`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new WorldPublishStatus(json);
    }

    /**
     * 
     * Publish a world. You can only publish one world per week.
     * 
     * @returns {Promise<Number>} Returns HTTP status code.
     */
    async PublishWorld(worldId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!worldId) throw new Error("Required Argument: worldId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}/publish`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return res.status;
    }

    /**
     * 
     * Unpublish a world. This does not delete a world, only makes it "private".
     * 
     * @returns {Promise<Number>} Returns HTTP status code.
     */
    async UnpublishWorld(worldId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!worldId) throw new Error("Required Argument: worldId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}/publish`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return res.status;
    }

    /**
     * 
     * Returns a worlds instance.
     * 
     * @returns {Promise<Instance>} Returns a single Instance object.
     */
    async GetWorldInstance(worldId = "", instanceId = "") {
        if(!this.#authCookie) throw new Error("Invalid Credentials", 401, {});
        if(!worldId || !instanceId) throw new Error("Required Argument(s): worldId, instanceId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/worlds/${worldId}/${instanceId}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);
        return new Instance(json);
    }

}

module.exports = { WorldsApi };