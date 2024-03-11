const { APIConfig } = require('../APIConfig.js');
const { InfoPush } = require('../InfoPush.js');
const { Error } = require('../Error.js');
const Util = require('../Util.js');

class SystemApi {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #GenerateParameters;

    constructor() {
        this.#GenerateParameters = Util.GenerateParameters;
    }

    /**
     * 
     * API config contains configuration that the clients needs to work properly.
     * 
     * @returns {Promise<APIConfig>} Returns a single APIConfig object.
     */
    async FetchAPIConfig() {
        const res = await fetch(`${this.#APIEndpoint}/config`);
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, {});
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
        const res = await fetch(`${this.#APIEndpoint}/infoPush${params ? "?" + params : ""}`);
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

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
        const res = await fetch(`${this.#APIEndpoint}/css/app.css${params ? "?" + params : ""}`);
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return json;
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
        const res = await fetch(`${this.#APIEndpoint}/js/app.js${params ? "?" + params : ""}`);
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return res.json();
    }

    /**
     * 
     * Returns the current number of online users.
     * 
     * @returns {Promise<number>} Returns the number of current online users.
     */
    async CurrentOnlineUsers() {
        const res = await fetch(`${this.#APIEndpoint}/visits`);
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return json;
    }

    /**
     * 
     * Returns the current time of the API server.
     * 
     * @returns {Promise<string>} Returns the server-side time as a string.
     */
    async CurrentSystemTime() {
        const res = await fetch(`${this.#APIEndpoint}/time`);
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return json;
    }
}

module.exports = { SystemApi };