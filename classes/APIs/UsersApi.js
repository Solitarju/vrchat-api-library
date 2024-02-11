const { User } = require('../User.js');
const { CurrentUser } = require('../CurrentUser.js');
const { LimitedUser } = require('../LimitedUser.js');
const { Group } = require('../Group.js');
const { Error } = require('../Error.js');

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
     * @returns {Promise<Array<LimitedUser>>} Returns an array of LimitedUser objects.
     */
    async SearchAllUsers({ displayName = "", returnAmount = 1, offset = 0 } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!displayName) return new Error("Required argument: displayName", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/users?search=${displayName}${returnAmount > 0 && returnAmount < 100 ? "&n=" + returnAmount : ""}${offset > 0 ? "&offset=" + offset : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        var objectArray = [];
        for(let i = 0; i < json.length; i++) {
            objectArray.push(new LimitedUser(json[i]));
        };
        return objectArray;
    }

    /**
     * 
     * Gets user object from userid.
     * 
     * @returns {Promise<User>} Returns a single User object.
     */
    async GetUserById(userid = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!userid) return new Error("Required argument: userId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/users/${userid}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new User(json);
    }

    /**
     * 
     * Updates current users information such as bio and status etc.
     * 
     * @param {Object} [json={}]
     * @param {string} [json.email=""]
     * @param {string} [json.birthday=""]
     * @param {string[]} [json.tags=[]]
     * @param {string} [json.status=""]
     * @param {string} [json.statusDescription=""]
     * @param {string} [json.bio=""]
     * @param {string[]} [json.bioLinks=[]]
     * 
     * @returns {Promise<CurrentUser>} Returns an updated CurrentUser object.
     */
    async UpdateUserInfo({email, birthday, tags, status, statusDescription, bio, bioLinks} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const args = {email, birthday, tags, status, statusDescription, bio, bioLinks};
        let bodyJSON = {};
        for(let i = 0; i < 7; i++) {
            let key = Object.keys(args)[i];
            if(args[key] !== undefined) bodyJSON[key] = args[key];
        }

        const res = await this.#fetch(`${this.#APIEndpoint}/users/${this.#userid}`, { method: "PUT", headers: this.#GenerateHeaders(true, "application/json"), body: JSON.stringify(bodyJSON) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new CurrentUser(json);
    }

    /**
     * 
     * Gets current users groups.
     * 
     * @returns {Promise<Array<Group>>} Returns an array of Group objects.
     */
    async GetUserGroups() {
        if(!this.#authCookie) return new Error('Invalid Credentials', 401, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/users/${this.#userid}/groups`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        var GroupArray = [];
        for(let i = 0; i < json.length; i++) {
            GroupArray.push(new Group(json[i]));
        }
        return GroupArray;
    }

    /**
     * 
     * Gets current users group requests.
     * 
     * @returns {Promise<Array<Group>>} Returns an array of group requests.
     */
    async GetUserGroupRequests() {
        if(!this.#authCookie) return new Error('Invalid Credentials', 401, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/users/${this.#userid}/groups/requested`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        var GroupArray = [];
        for(let i = 0; i < json.length; i++) {
            GroupArray.push(new Group(json[i]));
        }
        return GroupArray;
    }

}

module.exports = { UsersApi };