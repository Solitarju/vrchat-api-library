const { User } = require('../UserClass.js');
const { Error } = require('../ErrorClass.js');

class UsersApi {

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
     * Searches for users by displayname.
     * 
     * @returns {Promise<JSON>} Queries for users and returns user object.
     */
    async SearchAllUsers({ displayName = "", returnAmount = 1, offset = 0 } = {}) {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };
        if(!displayName.length > 0) throw Error("Missing argument displayName.");

        const res = await this.#fetch(`${this.#APIEndpoint}/users?search=${displayName}${returnAmount > 0 && returnAmount < 100 ? "&n=" + returnAmount : ""}${offset > 0 ? "&offset" + offset : ""}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, json: await res.json() };
    }

    /**
     * 
     * Gets user object from userid.
     * 
     * @returns {User} Returns JSON object of current user.
     */
    async GetUserById(userid = "") {
        if(!this.#authCookie.length > 0) return new Error("Invalid Credentials. Please make sure you are authenticated either through the VRChat helper class or manually for this object. If you authenticated, your credentials might have expired/invalidated.", 401, {});
        if(!userid.length > 0) return new Error("Missing userid argument.", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/users/${userid}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();
        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        return new User(json);
    }

    /**
     * 
     * Updates current user information such as bio and status etc.
     * 
     * @returns {Promise<JSON>} Returns updated user JSON object.
     */
    async UpdateUserInfo({email = "", birthday = "", tags = [], status = "", statusDescription = "", bio = "", bioLinks = []} = {}) {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };
        if(!email && !birthday && !tags && !status && !statusDescription && !bio && !bioLinks) throw Error("Missing argument userInfo JSON.");

        tags.length > 0 ? tags : tags = false;
        bioLinks.length > 0 ? bioLinks : bioLinks = false;

        var userInfoJSON = {};
        const userArgsArr = [email, birthday, tags, status, statusDescription, bio, bioLinks];
        for(var i = 0; i < userArgsArr.length; i++) {
            if(userArgsArr[i]) userInfoJSON[["email", "birthday", "tags", "status", "statusDescription", "bio", "bioLinks"][i]] = `${userArgsArr[i]}`;
        }

        const res = await this.#fetch(`${this.#APIEndpoint}/users/${this.#userid}`, { method: "PUT", headers: this.#GenerateHeaders(true, "application/json"), body: JSON.stringify(userInfoJSON) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, user: await res.json() };
    }

    /**
     * 
     * Gets current users groups.
     * 
     * @returns {Promise<JSON>} Returns JSON array of current users groups.
     */
    async GetUserGroups() {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };

        const res = await this.#fetch(`${this.#APIEndpoint}/users/${this.#userid}/groups`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, groups: await res.json() };
    }

    /**
     * 
     * Gets current user group requests.
     * 
     * @returns {Promise<JSON>} Returns JSON array of current users group requests.
     */
    async GetUserGroupRequests() {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };

        const res = await this.#fetch(`${this.#APIEndpoint}/users/${this.#userid}/groups/requested`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, groups: await res.json() };
    }

}

module.exports = { UsersApi };