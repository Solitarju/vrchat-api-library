const { UserExists } = require('../UserExists.js');
const { Error } = require('../Error.js');

class AuthenticationApi {

    #fetch;
    #UserAgent;

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

    constructor({userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}, fetch, UserAgent) {
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

    #GenerateHeaders(authentication = false, contentType = "", authCookie = "", twoFactorAuth = "") {
        var headers = new this.#fetch.Headers({
            "User-Agent": this.#UserAgent,
            "cookie": `${(this.#authCookie || authCookie) && authentication ? "auth=" + (authCookie ? authCookie : this.#authCookie) + "; " : ""}${(this.#twoFactorAuth || twoFactorAuth) && authentication ? "twoFactorAuth=" + (twoFactorAuth ? twoFactorAuth : this.#twoFactorAuth) + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    /**
     * 
     * Checks if a user exists on vrchat by using email, username or displayname (prioritizes that order).
     * 
     * @returns {Promise<UserExists>} UserExists Object inidicating whether user exists.
     */
    async UserExists({ email = "", username = "", displayName = "", excludeUserId = ""} = {}) {
        if(!email.length > 0 && !displayName.length > 0 && !username.length > 0) return new Error("Missing argument(s): email, displayName or userId", 401, {});

        const exclusion = excludeUserId.length > 0 ? `&excludeUserId=${excludeUserId}` : "";

        if(email.length > 0) {
            const res = await this.#fetch(`${this.#APIEndpoint}/auth/exists?email=${email}${exclusion}`, { headers: this.#GenerateHeaders() });
            const json = await res.json();
            
            if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
            return new UserExists(json);
        }

        if(username.length > 0) {
            const res = await this.#fetch(`${this.#APIEndpoint}/auth/exists?username=${username}${exclusion}`, { headers: this.#GenerateHeaders() });
            const json = await res.json();
            
            if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
            return new UserExists(json);
        }

        if(displayName.length > 0) {
            const res = await this.#fetch(`${this.#APIEndpoint}/auth/exists?displayName=${displayName}${exclusion}`, { headers: this.#GenerateHeaders() });
            const json = await res.json();
            
            if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
            return new UserExists(json);
        }
    }

    /**
     * 
     * Attempts authentication either by using username and password but prioritizing authCookie for session re-using.
     * 
     * @returns {Promise<JSON>} Returns JSON (with credentials if success) indicating whether login attempt invalid, successful or requires 2fa.
     */
    async Login({username = "", password = "", authCookie = "", twoFactorAuth = ""} = {}) {
        if(!authCookie) {
            if(!username && !password) return { success: false, status: 401 };
        }

        if(authCookie) {
            const res = await this.#fetch(`${this.#APIEndpoint}/auth/user`, { headers: this.#GenerateHeaders(true, "", authCookie, twoFactorAuth) });
            if(!res.ok && !username && !password) return { success: false, status: res.status }; // if request invalid and no username and pass creds are passed, return false otherwise try username and pass creds.

            if(res.ok) {
                const json = await res.json();
                if(json.requiresTwoFactorAuth) {
                    return { success: false, authCookie: authCookie, json: json };
                }
    
                return { success: true, authCookie: authCookie, twoFactorAuth: twoFactorAuth,  json: json };
            }
        }

        console.log("Logging in with username and password (creating new session), consider saving session details and re-using them using the getAuthentication method to avoid rate limiting.");

        if(username && password) {
            const Headers = new this.#fetch.Headers({
                "User-Agent": this.#UserAgent,
                "authorization": `Basic ${username && password ? btoa(`${encodeURI(username)}:${encodeURI(password)}`) : ""}`
            });

            const res = await this.#fetch(`${this.#APIEndpoint}/auth/user`, { headers: Headers });
            if(!res.ok) return { success: false, status: res.status };

            const headers = await res.headers.get('set-cookie');
            const _authCookie = headers.substring(headers.indexOf("auth=") + 5, headers.substring(headers.indexOf("auth=") + 5).indexOf(";") + 5);

            const json = await res.json();
            if(json.requiresTwoFactorAuth) {
                return { success: false, authCookie: _authCookie, json: json };
            }

            return { success: true, authCookie: _authCookie, json: json };
        }
    }

    /**
     * 
     * Returns JSON userObject of the user currently authenticated.
     * 
     * @returns {Promise<JSON>} Returns boolean indicating success and if successful user JSON object. { success: Boolean, json: JSON }
     */
    async GetCurrentUser() {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await this.#fetch(`${this.#APIEndpoint}/users/${this.#userid}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, json: await res.json() };
    }

    /**
     * 
     * Finishes the login sequence with a normal 2FA-generated code for accounts with 2FA-protection enabled.
     * 
     * @returns {Promise<JSON>} Returns JSON with boolean value "verified" and string twoFactorAuth.
     */
    async verifyTotp(authCookie = "", totp = "") {
        if(!authCookie || !totp) return { success: false, status: 401 };

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/twofactorauth/totp/verify`, { method: "POST", headers: this.#GenerateHeaders(true, "application/json", authCookie), body: JSON.stringify({ "code": totp }) });
        if(!res.ok) return { success: false, error: res.status };

        const responseHeaders = await res.headers.get('set-cookie');
        const twoFactorAuthCode = responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14, responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14).indexOf(";") + 14);
        
        const json = await res.json();
        return { success: json.verified, twoFactorAuth: twoFactorAuthCode };
    }

    /**
     * 
     * Finishes the login sequence with an OTP (One Time Password) recovery code for accounts with 2FA-protection enabled.
     * 
     * @returns {Promise<JSON>} Returns JSON with boolean value "verified" and string twoFactorAuth.
     */
    async verifyOtp(authCookie = "", otp = "") {
        if(!authCookie || !otp) return { success: false, status: 401 };

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/twofactorauth/otp/verify`, { method: "POST", headers: this.#GenerateHeaders(true, "application/json", authCookie), body: JSON.stringify({ "code": otp }) });
        if(!res.ok) return { success: false, error: res.status };

        const responseHeaders = await res.headers.get('set-cookie');
        const twoFactorAuthCode = responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14, responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14).indexOf(";") + 14);
        
        const json = await res.json();
        return { success: json.verified, twoFactorAuth: twoFactorAuthCode };
    }

    /**
     * 
     * Finishes the login sequence with an 2FA email code.
     * 
     * @returns {Promise<JSON>} Returns JSON with boolean value "verified" and string twoFactorAuth.
     */
    async verifyEmailOtp(authCookie = "", emailotp = "") {
        if(!authCookie || !emailotp) return { success: false, status: 401 };

        const res = await this.#fetch(`${this.#APIEndpoint}/auth/twofactorauth/emailotp/verify`, { method: "POST", headers: this.#GenerateHeaders(true, "application/json", authCookie), body: JSON.stringify({ code: emailotp }) });
        if(!res.ok) return { success: false, error: res.status };
        
        const responseHeaders = await res.headers.get('set-cookie');
        const twoFactorAuthCode = responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14, responseHeaders.substring(responseHeaders.indexOf("twoFactorAuth=") + 14).indexOf(";") + 14);
        
        const json = await res.json();
        return { success: json.verified, twoFactorAuth: twoFactorAuthCode };
    }

    /**
     * 
     * Verifies whether provided session token/auth cookie is currently valid.
     * (Will always log error to the console if token invalid, even if no error has occurred).
     * 
     * @returns {Promise<boolean>} Returns boolean indicating validity of token/cookie.
     */
    async VerifyAuthToken(authCookie = "") {
        if(!authCookie) return { success: true, ok: false };

        const res = await this.#fetch(`${this.#APIEndpoint}/auth`, { headers: this.#GenerateHeaders(true, "", authCookie) });
        if(!res.ok) return { success: false, status: res.status };
        
        const json = await res.json();
        if(!json.ok) return { success: false, status: res.status };

        return { success: true, ok: json.ok};
    }

    /**
     * 
     * Invalidates currently authenticated session authCookie.
     * 
     * @returns {Promise<Boolean>} Returns boolean indicating whether function was successful.
     */
    async Logout(authCookie = "") {
        if(!authCookie) return { success: false, status: 401 };

        const res = await this.#fetch(`${this.#APIEndpoint}/logout`, { method: "PUT", headers: this.#GenerateHeaders(true, "", authCookie), body: JSON.stringify({ "auth": authCookie }) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true };
    }

    /**
     * 
     * Returns JSON object of all credentials required for vrchat's api.
     * 
     * @returns {JSON} Returns JSON object of all credentials required for vrchat's api.
     */
    GetAuthentication() {
        if(!this.#authCookie) return { success: false, status: 401 };

        return { success: true, userid: this.#userid, authCookie: this.#authCookie, twoFactorAuth: this.#twoFactorAuth };
    }
}

module.exports = { AuthenticationApi };