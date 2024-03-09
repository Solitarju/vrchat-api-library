const { APIConfig } = require('../APIConfig.js');
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

     * include is used to query what Information Pushes should be included in the response. If include is missing or empty, then no notices will normally be returned. This is an "any of" search.  

     * require is used to limit what Information Pushes should be included in the response. This is usually used in combination with include, and is an "all of" search.
     * 
     * @returns {Promise<JSON>}
     */
    async ShowInformationNotices({ require = "", include = "" } = {}) {

        const params = this.#GenerateParameters({ require, include });
        const res = await fetch(`${this.#APIEndpoint}/infoPush${params ? "?" + params : ""}`);
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Fetches the CSS code to the frontend React website.
     * 
     * @returns {Promise<JSON>}
     */
    async DownloadCSS(variant = "public", branch = "main") {

        const params = this.#GenerateParameters({ variant, branch });
        const res = await fetch(`${this.#APIEndpoint}/css/app.css${params ? "?" + params : ""}`);
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: { css: await res.json() } };
    }

    /**
     * 
     * Fetches the JavaScript code to the frontend React website.
     * 
     * @returns {Promise<JSON>}
     */
    async DownloadJavaScript(variant = "public", branch = "main") {

        const params = this.#GenerateParameters({ variant, branch });
        const res = await fetch(`${this.#APIEndpoint}/js/app.js${params ? "?" + params : ""}`);
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: { javascript: await res.json().toString() } };
    }

    /**
     * 
     * Returns the current number of online users.
     * 
     * @returns {Promise<JSON>}
     */
    async CurrentOnlineUsers() {

        const res = await fetch(`${this.#APIEndpoint}/visits`);
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: { users: await res.json() } };
    }

    /**
     * 
     * Returns the current time of the API server.
     * 
     * @returns {Promise<JSON>}
     */
    async CurrentSystemTime() {

        const res = await fetch(`${this.#APIEndpoint}/time`);
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: { time: await res.json() } };
    }
}

module.exports = { SystemApi };