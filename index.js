/*
MIT License

Copyright (c) [2024] [Solitarju]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const fetch = require('node-fetch');

const { Enums } = require('./classes/APIs/Enums.js');
const { EventsApi } = require('./classes/APIs/EventsApi.js');
const { AuthenticationApi } = require('./classes/APIs/AuthenticationApi.js');
const { AvatarsApi } = require('./classes/APIs/AvatarsApi.js');
const { EconomyApi } = require('./classes/APIs/EconomyApi.js');
const { FavoritesApi } = require('./classes/APIs/FavouritesApi.js');
const { FilesApi } = require('./classes/APIs/FilesApi.js');
const { FriendsApi } = require('./classes/APIs/FriendsApi.js');
const { GroupsApi } = require('./classes/APIs/GroupsApi.js');
const { InviteApi } = require('./classes/APIs/InviteApi.js');
const { InstancesApi } = require('./classes/APIs/InstancesApi.js');
const { NotificationsApi } = require('./classes/APIs/NotificationsApi.js');
const { PermissionsApi } = require('./classes/APIs/PermissionsApi.js');
const { PlayerModerationApi } = require('./classes/APIs/PlayerModerationApi.js');
const { SystemApi } = require('./classes/APIs/SystemApi.js');
const { UsersApi } = require('./classes/APIs/UsersApi.js');
const { WorldsApi } = require('./classes/APIs/WorldsApi.js');

const UserAgent = `vrchat-api-library/${require('./package.json').version} admin@solitarju.uk`;

class VRChat {

    #userid = ""; // This is referenced even though greyed out, removing this will break the code.
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
    SystemApi = new SystemApi(fetch, UserAgent);
    UsersApi = new UsersApi({}, fetch, UserAgent);
    WorldsApi = new WorldsApi({}, fetch, UserAgent);

    constructor(debug = false) {
        this.#debug = debug;
    }

    #Debug(x) {
        if(!this.#debug === true) return;
        console.log(x);
    }

    /**
     * 
     * Takes user details and internally creates new session or uses existing session for later ease of use.
     * For more information check the community vrchat api docs, this node library is built to the specifications here. https://vrchatapi.github.io/docs/api/
     * 
     * @returns {Promise<JSON>} Returns JSON object with authentication details and user object.
     */
    async Authenticate({username = "", password = "", authCookie = "", twoFactorAuth = ""} = {}, twoFactorCallback) {
        if((!username || !password) && (!authCookie)) return false;

        const user = await this.AuthenticationApi.Login({ username: username, password: password, authCookie: authCookie, twoFactorAuth: twoFactorAuth });

        if(!user.success) {
            if(!user.json || !user.json.requiresTwoFactorAuth) return user;
            if(!twoFactorCallback || typeof(twoFactorCallback) !== "function") return user; // bad failures <^^^ :(

            const code = await twoFactorCallback(user.json["requiresTwoFactorAuth"]);

            if(user.json.requiresTwoFactorAuth[0].toLowerCase() === 'emailotp') {
                if(!code) return user;

                const twoFactor = await this.AuthenticationApi.verifyEmailOtp(user.authCookie, code);
                if(!twoFactor.success) return user;

                const auth = await this.Authenticate({
                    authCookie: user.authCookie,
                    twoFactorAuth: twoFactor.twoFactorAuth
                });
                return auth;
            }

            if(user.json.requiresTwoFactorAuth[0].toLowerCase() === 'totp') {
                if(!code) return user;

                const twoFactor = await this.AuthenticationApi.verifyTotp(user.authCookie, code);
                if(!twoFactor.success) return user;

                const auth = await this.Authenticate({
                    authCookie: user.authCookie,
                    twoFactorAuth: twoFactor.twoFactorAuth
                });
                return auth;
            }

            if(user.json.requiresTwoFactorAuth[0].toLowerCase() === 'otp') {
                if(!code) return user;

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
        this.#twoFactorAuth = user["twoFactorAuth"] ? twoFactorAuth : "";

        var objJson = { userid: user.json.id, authCookie: user.authCookie, twoFactorAuth: this.#twoFactorAuth, debug: this.#debug };

        this.EventsApi = new EventsApi(objJson, fetch, UserAgent);
        this.AuthenticationApi = new AuthenticationApi(objJson, fetch, UserAgent);
        this.AvatarsApi = new AvatarsApi(objJson, fetch, UserAgent);
        this.EconomyApi = new EconomyApi(objJson, fetch, UserAgent);
        this.FavoritesApi = new FavoritesApi(objJson, fetch, UserAgent);
        this.FilesApi = new FilesApi(objJson, fetch, UserAgent);
        this.FriendsApi = new FriendsApi(objJson, fetch, UserAgent);
        this.GroupsApi = new GroupsApi(objJson, fetch, UserAgent);
        this.InviteApi = new InviteApi(objJson, fetch, UserAgent);
        this.InstancesApi = new InstancesApi(objJson, fetch, UserAgent);
        this.NotificationsApi = new NotificationsApi(objJson, fetch, UserAgent);
        this.PermissionsApi = new PermissionsApi(objJson, fetch, UserAgent);
        this.PlayerModerationApi = new PlayerModerationApi(objJson, fetch, UserAgent);
        this.SystemApi = new SystemApi(fetch, UserAgent);
        this.UsersApi = new UsersApi(objJson, fetch, UserAgent);
        this.WorldsApi = new WorldsApi(objJson, fetch, UserAgent);

        return user;
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
        this.SystemApi = new SystemApi();
        this.UsersApi = new UsersApi();
        this.WorldsApi = new WorldsApi();

        return { success: true };
    }
}

module.exports = { VRChat, EventsApi, AuthenticationApi, AvatarsApi, EconomyApi, FavoritesApi, FilesApi, FriendsApi, GroupsApi, InviteApi, InstancesApi, NotificationsApi, PermissionsApi, PlayerModerationApi, SystemApi, UsersApi, WorldsApi, Enums };