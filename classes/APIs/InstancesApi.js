const { Instance } = require('../Instance.js');
const { InstanceShortName } = require('../InstanceShortName.js');
const { Success } = require('../Success.js');
const { Error } = require('../Error.js');

class InstancesApi {

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

    /**
     * 
     * Returns an instance. Please read Instances Tutorial for more information on Instances.  
     * 
     * If an invalid instanceId is provided, this endpoint will simply return "null"!
     * 
     * @returns {Promise<Instance>} Returns a single Instance object.
     */
    async GetInstance(worldId = "", instanceId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!worldId || !instanceId) return new Error("Required Argument(s): worldId, instanceId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/instances/${worldId}:${instanceId}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Instance(json);
    }

    /**
     * 
     * Returns an instance short name.
     * 
     * @returns {Promise<InstanceShortName>} Returns a single InstanceShortName object. 
     */
    async GetInstanceShortName(worldId = "", instanceId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!worldId || !instanceId) return new Error("Required Argument(s): worldId, instanceId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/instances/${worldId}:${instanceId}/shortName`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new InstanceShortName(json);
    }

    /**
     * 
     * Sends an invite to the instance to yourself.
     * 
     * @returns {Promise<Success>} Returns a single Success object.
     */
    async SendSelfInvite(worldId = "", instanceId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!worldId || !instanceId) return new Error("Required Argument(s): worldId, instanceId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/invite/myself/to/${worldId}:${instanceId}`, { method: 'POST', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

    /**
     * 
     * Returns an instance.
     * 
     * @returns {Promise<Instance>} Returns a single Instance object.
     */
    async GetInstanceByShortName(shortName = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!shortName) return new Error("Required Argument: shortName", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/instances/s/${shortName}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, res);
        return new Instance(json);
    }

}

module.exports = { InstancesApi };