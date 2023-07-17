/*
<Nodejs library to interface with the vrchat's backend REST API>
    Copyright (C) <2023>  <Solitarju> 

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// RAUERUAURURAUEAURUARUE! Did I scare you? yeah I bet I did, you coward. You make me sick, your weakness is pathetic.
// Also hello! Why are you poking around inside my source code? :totally_a_flushed_emoji:
// Coding this made me realise why Typescript exists, also makes me wonder why I haven't learnt it yet.

const fetch = require('node-fetch');

const { Enums } = require('./classes/Enums.js');
const { EventsApi } = require('./classes/EventsApi.js');
const { AuthenticationApi } = require('./classes/AuthenticationApi.js');
const { AvatarsApi } = require('./classes/AvatarsApi.js');
const { EconomyApi } = require('./classes/EconomyApi.js');
const { FavoritesApi } = require('./classes/FavouritesApi.js');
const { FilesApi } = require('./classes/FilesApi.js');
const { FriendsApi } = require('./classes/FriendsApi.js');

const { GroupsApi } = require('./classes/GroupsApi.js');
const { InviteApi } = require('./classes/InviteApi.js');
const { InstancesApi } = require('./classes/InstancesApi.js');
const { NotificationsApi } = require('./classes/NotificationsApi.js');
const { PermissionsApi } = require('./classes/PermissionsApi.js');
const { PlayerModerationApi } = require('./classes/PlayerModerationApi.js');
const { SystemApi } = require('./classes/SystemApi.js');
const { UsersApi } = require('./classes/UsersApi.js');
const { WorldsApi } = require('./classes/WorldsApi.js');

const UserAgent = "node-vrchat-api/1.2.1 contact@solitarju.uk";

class VRChat {

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

    EventsApi = new EventsApi({}, fetch, UserAgent);
    AuthenticationApi = new AuthenticationApi({}, fetch, UserAgent);
    AvatarsApi = new AvatarsApi({}, fetch, UserAgent);
    EconomyApi = new EconomyApi({}, fetch, UserAgent);
    FavoritesApi = new FavoritesApi({}, fetch, UserAgent);
    FilesApi = new FilesApi({}, fetch, UserAgent);
    FriendsApi = new FriendsApi({}, fetch, UserAgent);
    GroupsApi = new GroupsApi({}, fetch, UserAgent);
    InviteApi = new InviteApi({}, fetch, UserAgent);
    InstancesApi = new InstancesApi({}, fetch, UserAgent);
    NotificationsApi = new NotificationsApi({}, fetch, UserAgent);
    PermissionsApi = new PermissionsApi({}, fetch, UserAgent);
    PlayerModerationApi = new PlayerModerationApi({}, fetch, UserAgent);
    SystemApi = new SystemApi({}, fetch, UserAgent);
    UsersApi = new UsersApi({}, fetch, UserAgent);
    WorldsApi = new WorldsApi({}, fetch, UserAgent);

    constructor(debug = false) {
        this.#debug = debug;
    }

    #Debug(x) {
        if(!this.#debug === true) return;
        console.log(x);
    }

    #GenerateHeaders(authentication = false, contentType = "") {
        var headers = new fetch.Headers({
            "User-Agent": UserAgent,
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    /**
     * 
     * Takes user details and internally creates new session or uses existing session for later ease of use.
     * For more information check the community vrchat api docs, this node library is built to the specifications here. https://vrchatapi.github.io/docs/api/
     * 
     * @returns {Promise<JSON>} Returns JSON object with authentication details and user object.
     */
    async Authenticate({username = "", password = "", authCookie = "", twoFactorAuth = ""} = {}, twoFactorCallback) {
        if((!username.length > 0 || !password.length > 0) && (!authCookie.length > 0)) return false;

        const user = await this.AuthenticationApi.Login({ username: username, password: password, authCookie: authCookie, twoFactorAuth: twoFactorAuth });

        if(!user.success) {
            if(!user.json) return user;
            if(!user.json.requiresTwoFactorAuth) return user;
            if(!twoFactorCallback || typeof(twoFactorCallback) !== "function") return user; // bad failures <^^^ :(

            const code = await twoFactorCallback(user.json["requiresTwoFactorAuth"]);

            if(user.json.requiresTwoFactorAuth[0].toLowerCase() === 'emailotp') {
                if(!code || !code.length > 0) return user;

                const twoFactor = await this.AuthenticationApi.verifyEmailOtp(user.authCookie, code);
                this.#Debug(twoFactor);
                if(!twoFactor.success) return user;

                const auth = await this.Authenticate({
                    authCookie: user.authCookie,
                    twoFactorAuth: twoFactor.twoFactorAuth
                });
                return auth;
            }

            if(user.json.requiresTwoFactorAuth[0].toLowerCase() === 'totp') {
                if(!code || !code.length > 0) return user;

                const twoFactor = await this.AuthenticationApi.verifyTotp(user.authCookie, code);
                if(!twoFactor.success) return user;

                const auth = await this.Authenticate({
                    authCookie: user.authCookie,
                    twoFactorAuth: twoFactor.twoFactorAuth
                });
                return auth;
            }

            if(user.json.requiresTwoFactorAuth[0].toLowerCase() === 'otp') {
                if(!code || !code.length > 0) return user;

                const twoFactor = await this.AuthenticationApi.verifyOtp(user.authCookie, code);
                if(!twoFactor.success) return user;

                const auth = await this.Authenticate({
                    authCookie: user.authCookie,
                    twoFactorAuth: twoFactor.twoFactorAuth
                });
                return auth;
            }
        }

        this.#userid = user.json.id;
        this.#twoFactorAuth = user["twoFactorAuth"] ?? twoFactorAuth ?? "";

        this.EventsApi = new EventsApi({ userid: user.json.id,authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.AuthenticationApi = new AuthenticationApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.AvatarsApi = new AvatarsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.EconomyApi = new EconomyApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.FavoritesApi = new FavoritesApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.FilesApi = new FilesApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.FriendsApi = new FriendsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.GroupsApi = new GroupsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.InviteApi = new InviteApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.InstancesApi = new InstancesApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.NotificationsApi = new NotificationsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.PermissionsApi = new PermissionsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.PlayerModerationApi = new PlayerModerationApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.UsersApi = new UsersApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);
        this.WorldsApi = new WorldsApi({ userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug }, fetch, UserAgent);

        return user; // success :)
    }

    /**
     * 
     * Clears internal cache and objects of authentication details.
     * 
     * @returns {JSON} Returns JSON object indicating whether de-authentication operation was successful.
     */
    Deauthenticate() {
        if(!this.#authCookie.length > 0) return { success: false, status: 401 };

        this.#userid = "";
        this.#authCookie = "";
        this.#twoFactorAuth = "";

        this.EventsApi = new EventsApi();
        this.AuthenticationApi = new AuthenticationApi();
        this.AvatarsApi = new AvatarsApi();
        this.EconomyApi = new EconomyApi();
        this.FavoritesApi = new FavoritesApi();
        this.FilesApi = new FilesApi();
        this.FriendsApi = new FriendsApi();
        this.GroupsApi = new GroupsApi();
        this.InviteApi = new InviteApi();
        this.InstancesApi = new InstancesApi();
        this.NotificationsApi = new NotificationsApi();
        this.PermissionsApi = new PermissionsApi();
        this.PlayerModerationApi = new PlayerModerationApi();
        this.UsersApi = new UsersApi();
        this.WorldsApi = new WorldsApi();

        return { success: true };
    }
};

module.exports = { VRChat, EventsApi, AuthenticationApi, AvatarsApi, EconomyApi, FavoritesApi, FilesApi, FriendsApi, GroupsApi, InviteApi, InstancesApi, NotificationsApi, PermissionsApi, PlayerModerationApi, SystemApi, UsersApi, WorldsApi, Enums };