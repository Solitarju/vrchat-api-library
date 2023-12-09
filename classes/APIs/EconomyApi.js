const { Transaction } = require('../Transaction.js');
const { UserSubscription } = require('../UserSubscription.js');
const { Error } = require('../Error.js');

class EconomyApi {

    #fetch;
    #UserAgent;

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

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
     * Get all own Steam transactions.
     * 
     * @returns {Promise<Array<Transaction>|Error>} Returns an array of Transaction objects.
     */
    async ListSteamTransactions() {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/Steam/transactions`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        let returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new Transaction(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Get a list of all current user subscriptions.
     * 
     * @returns {Promise<Array<UserSubscription>|Error>} Returns an array of UserSubscription objects.
     */
    async GetCurrentSubscriptions() {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/subscription`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        let returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new UserSubscription(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * List all existing Subscriptions. For example, "vrchatplus-monthly" and "vrchatplus-yearly".
     * 
     * @returns {Promise<JSON>}
     */
    async ListSubscriptions() {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await this.#fetch(`${this.#APIEndpoint}/subscriptions`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Get a single License Group by given ID.
     * 
     * @returns {Promise<JSON>}
     */
    async GetLicenseGroup(licenseGroupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!licenseGroupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/licenseGroups/${licenseGroupId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

module.exports = { EconomyApi };