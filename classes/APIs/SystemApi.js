const { APIConfig } = require('../APIConfig.js');
const { InfoPush } = require('../InfoPush.js');
const { Error } = require('../Error.js');
const Util = require('../Util.js');

class SystemApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #fetch;
    #UserAgent;
    #authCookie;
    #twoFactorAuth;

    #GenerateParameters;

    constructor(fetch, UserAgent) {
        this.#fetch = fetch;
        this.#UserAgent = UserAgent;
        this.#GenerateParameters = Util.GenerateParameters;
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
     * API config contains configuration that the clients needs to work properly.
     * 
     * @returns {Promise<APIConfig>} Returns a single APIConfig object.
     */
    async FetchAPIConfig() {
        const res = await this.#fetch(`${this.#APIEndpoint}/config`, { headers: this.#GenerateHeaders() });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, {});
        return new APIConfig(json);
    }

    /**
     * **EARLY ACCESS**
     * 
     * IPS (Info Push System) is a system for VRChat to push out dynamic information to the client. This is primarily used by the Quick-Menu info banners, but can also be used to e.g. alert you to update your game to the latest version.  
     * 
     * `include` is used to query what Information Pushes should be included in the response. If include is missing or empty, then no notices will normally be returned. This is an "any of" search.  
     * 
     * `require` is used to limit what Information Pushes should be included in the response. This is usually used in combination with `include`, and is an "all of" search.
     * 
     * @param {Object} [json={}] 
     * @param {string} [json.require=""] 
     * @param {string} [json.include=""] 
     * 
     * @returns {Promise<Array<InfoPush>>} Returns an array of InfoPush objects.
     */
    async ShowInformationNotices({require, include} = {}) {
        const params = this.#GenerateParameters({ require, include });
        const res = await this.#fetch(`${this.#APIEndpoint}/infoPush${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders() });
        const json = await res.json();

        if(!res.ok) throw new Error(json.error?.message ?? "", res.status, json);

        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new InfoPush(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Fetches the CSS code to the frontend React website.
     * 
     * @param {string} [variant="public"] 
     * @param {string} [branch="main"] 
     * 
     * @returns {Promise<string>} Returns CSS as a string.
     */
    async DownloadCSS(variant, branch) {
        const params = this.#GenerateParameters({ variant, branch });
        const res = await this.#fetch(`${this.#APIEndpoint}/css/app.css${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders() });
        const content = await res.text().catch(err => {});

        if(!res.ok) throw new Error((await res.json()).error?.message ?? "", res.status, {});

        return content ?? "";
    }

    /**
     * 
     * Fetches the JavaScript code to the frontend React website.
     * 
     * @param {string} [variant="public"] 
     * @param {string} [branch="main"] 
     * 
     * @returns {Promise<string>} Returns JavaScript from the VRChat website's frontend as a string.
     */
    async DownloadJavaScript(variant, branch) {
        const params = this.#GenerateParameters({ variant, branch });
        const res = await this.#fetch(`${this.#APIEndpoint}/js/app.js${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders() });
        const content = await res.text().catch(err => {});

        if(!res.ok) throw new Error((await res.json()).error?.message ?? "", res.status, {});

        return content ?? "";
    }

    /**
     * 
     * Returns the current number of online users.
     * 
     * @returns {Promise<number>} Returns the number of current online users.
     */
    async CurrentOnlineUsers() {
        const res = await this.#fetch(`${this.#APIEndpoint}/visits`, { headers: this.#GenerateHeaders() });
        const content = await res.text().catch(err => {});

        if(!res.ok) throw new Error((await res.json()).error?.message ?? "", res.status, {});

        return content ?? "";
    }

    /**
     * 
     * Returns the current time of the API server.
     * 
     * @returns {Promise<string>} Returns the server-side time as a string.
     */
    async CurrentSystemTime() {
        const res = await fetch(`${this.#APIEndpoint}/time`, { headers: this.#GenerateHeaders() });
        const content = await res.text().catch(err => {});

        if(!res.ok) throw new Error((await res.json()).error?.message ?? "", res.status, {});

        return content ?? "";
    }
}

module.exports = { SystemApi };