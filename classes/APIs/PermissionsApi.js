const { Permission } = require('../Permission.js')
const { Error } = require('../Error.js');

class PermissionsApi {

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
     * Returns a list of all permissions currently granted by the user. Permissions are assigned e.g. by subscribing to VRC+.
     * 
     * @returns {Promise<Array<Permission>>} Returns an array of Permission objects.
     */
    async GetAssignedPermissions() {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/permissions`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        
        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new Permission(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Returns a single permission. This endpoint is pretty useless, as it returns the exact same information as /auth/permissions.
     * 
     * @param {string} permissionId
     * 
     * @returns {Promise<Permission>} Returns a single Permission object.
     */
    async GetPermission(permissionId) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!permissionId) return new Error("Required Argument(s): permissionId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/permissions/${permissionId}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Permission(json);
    }

}

module.exports = { PermissionsApi };