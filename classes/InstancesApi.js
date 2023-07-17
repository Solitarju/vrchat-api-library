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
     * @returns {Promise<JSON>} 
     */
    async GetInstance(worldId = "", instanceId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!worldId || !instanceId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/instances/${worldId}:${instanceId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns an instance short name.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetInstanceShortName(worldId = "", instanceId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!worldId || !instanceId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/instances/${worldId}:${instanceId}/shortName`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Sends an invite to the instance to yourself.
     * 
     * @returns {Promise<JSON>} 
     */
    async SendSelfInvite(worldId = "", instanceId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!worldId || !instanceId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/invite/myself/to/${worldId}:${instanceId}`, { method: 'POST', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns an instance.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetInstanceByShortName(shortName = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!shortName) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/instances/s/${shortName}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

module.exports = { InstancesApi };