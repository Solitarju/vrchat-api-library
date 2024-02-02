const { LimitedUser } = require('../LimitedUser.js');
const { FriendStatus } = require('../FriendStatus.js');
const { Notification } = require('../Notification.js');
const { Success } = require('../Success.js');
const { Error } = require('../Error.js');
const Util = require('../Util.js');

class FriendsApi {

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
     * List information about friends.
     * 
     * @returns {Promise<Array<LimitedUser>>} Returns an array of LimitedUser objects.
     */
    async ListFriends({ offset = 0, n = 60, offline = false } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const params = this.#GenerateParameters({ offset, n, offline });
        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/friends${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new LimitedUser(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Send a friend request to another user.
     * 
     * @returns {Promise<Notification>} Returns a notification object.
     */
    async SendFriendRequest(userId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        if(!userId) return new Error("Missing Argument: userId", 400, {});
        
        const res = await this.#fetch(`${this.#APIEndpoint}/user/${userId}/friendRequest`, { method: 'POST', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Notification(json);
    }

    /**
     * 
     * Deletes an outgoing friend request to another user. To delete an incoming friend request, use the deleteNotification method instead.
     * 
     * @returns {Promise<Success>} Returns a Success object if the operation was successful.
     */
    async DeleteFriendRequest(userId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        if(!userId) return new Error("Missing Argument: userId", 400, {});
        
        const res = await this.#fetch(`${this.#APIEndpoint}/user/${userId}/friendRequest`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

    /**
     * 
     * Retrieve if the user is currently a friend with a given user, if they have an outgoing friend request, and if they have an incoming friend request. The proper way to receive and accept friend request is by checking if the user has an incoming Notification of type friendRequest, and then accepting that notification.
     * 
     * @returns {Promise<FriendStatus>} Returns a FriendStatus object with values depending on the friendship status of the current user and specified user.
     */
    async CheckFriendStatus(userId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        if(!userId) return new Error("Missing Argument: userId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/user/${userId}/friendStatus`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new FriendStatus(json);
    }

    /**
     * 
     * Unfriend a user by userID.
     * 
     * @returns {Promise<Success>} Returns a Success object if the operation was successful.
     */
    async Unfriend(userId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials.", 401, {});
        if(!userId) return new Error("Missing Argument: userId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/user/friends/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }
}

module.exports = { FriendsApi };