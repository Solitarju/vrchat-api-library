# Node VRChat API Library

***Updated docs and readme soon™***

[Join the Discord server for support or other queries!](https://discord.gg/cfdjj7TbaF)

Easy to build Node.JS applications using [vrchat-api-library](https://www.npmjs.com/package/vrchat-api-library).

Vrchat-api-library is a node library around the VRChat REST API as documented in the [*Unofficial* VRChat API docs](https://vrchatapi.github.io/docs/api/).  
Currently only 2 out of 15 major parts of the documented API have been developed in this library, but it also includes **websockets** allowing for real-time constant communication between clients and VRChat's backend.

This isn't complete yet I will be working on it over time to complete 100% coverage + websockets and maybe OSC, but most importantly I will try to get this updated so it is functional, stable and up to date with VRChat's backend.  

- [Disclaimer](#disclaimer)
- [TODO](#todo)
- [Installation](#installation)  
- [Getting Started](#getting-started)
- [Classes/API Coverage](#classesapi-coverage)
- [Functions](#functions)
- [Usage Examples](#example-code)

### **Disclaimer**  

**Words from VRChat on using the VRChat API from their Discord server,**  
**I'd like to use your API to do some stuff!**
Sure. Our policy on the use of the VRChat API is "don't be malicious". Here's the long version of that:
- **Do not submit repeated, unmetered requests.** Cache data when appropriate. Rate limit and implement some type of back-off for handling errors.
- **Do not request log-in information from users in any situation.** You should never ask for someone's VRChat username/password, and definitely should never store credentials. This includes login tokens or session data.
- **Do not act on behalf of another user.** If a user account is interacting with our API, we assume that the interaction comes from their device and IP. Breaking that assumption causes bad things to happen.
- **Applications must identify themselves properly using the User-Agent request header.** (This is automatically managed by vrchat-api-library) Use this format: applicationName/Version contactInfo. For example: VRCAPIApp/1.5.1 contact@example.com. Failing to identify yourself clearly or identifying yourself improperly will result in moderation action.

- If we detect malicious use of the API, associated accounts with the actions observed may be subject to Moderation action.

We do not offer support or documentation for using the API with non-official applications. Endpoints may be added, removed, change format, or change locations with no warning.

**More official word from VRChat on the unofficial VRChat API docs,**  
Use of the API using applications other than the approved methods (website, VRChat application) are not officially supported. You may use the API for your own application, but keep these guidelines in mind:

- We do not provide documentation or support for the API.
- Do not make queries to the API more than once per 60 seconds.
- Abuse of the API may result in account termination.
- Access to API endpoints may break at any given time, with no warning.

### **TODO**
- 100% Coverage of the API documented on the [Unofficial API Docs](https://vrchatapi.github.io/docs/api/).
- User Class instead of raw JSON.
- OSC (Potentially).

### **Installation**
```
npm install vrchat-api-library
```

### **Getting Started**
```javascript
const { Vrchat, EventType, EventsApi, AuthenticationApi, UsersApi } = require('vrchat-api-library'); // Require the classes you need, or all of them.

async function GetOTP() {
    // Return OTP/One Time Password as string
}

async function Main() {
    // NOTE: Some functions may be used without authentication, but the majority will throw a 401 (Unauthorized/Invalid Credentials) HTTP Error.
    const vrchat = new Vrchat(); // Create Vrchat object.

    // You can provide both username & password and/or authCookie with twoFactorAuth if needed, will use authCookie first, if authCookie invalid will fallback to username & password.
    const auth = await vrchat.Authenticate({
        username: "username",
        password: "securepassword123",
        authCookie: "authCookie",
        twoFactorAuth: "twoFactorAuth string" // NOT OTP CODE
    }, GetOTP); // Provide function **CALLBACK** (can be async/promise) which returns OTP/One Time Password code as a string.

    console.log(auth); // If successful will return user JSON object.

    // Now all the Api objects inside your Vrchat object will be automatically authenticated as long as authentication was successful.
    // EventsApi
    vrchat.Events

    // AuthenticationApi
    vrchat.Authentication

    // UsersApi
    vrchat.Users
}
```

### **Classes/API Coverage**
- Class: **Vrchat**
    - A Class designed to handle authentication and manage the rest of the library automatically for you.
- Class: **EventsApi** (Websockets)
    - Highly stable websocket connection for real time user and friend events. **(Tested for extended periods of time. 48+ hours straight)**
    - Custom "user-online" & "user-offline" events.
    - Completely undocumented so expect some missing coverage **(Still functions if you know the event type, you can just pass it as a string)** but completely stable and modular.
- Class: **AuthenticationApi**
    - Reusable session credentials so you don't get session limited.
- Class: **UsersApi**
    - Honestly nothing special here, works as intended.

### **Functions**
*Most arguments in this library are optional and done through json such as vrchat.Authenticate({ username: "username", password: "password" })*  

Most functions will return the JSON response straight from the network request in the format of { success: *boolean*, json: *JSON* } OR in the case of errors, a HTTP error code in place of the JSON { success: *boolean*, status: *integer* }.
- **Vrchat** (Class)
    - **Constructor Argument** - debug?: *boolean*
    - **Async Function** - Authenticate **(Takes user details and internally creates new session or uses existing session for later ease of use).**
        - **Argument** - Arguments?: *JSON*
            - **JSON Property** - username?: *string*
            - **JSON Property** - password?: *string*
            - **JSON Property** - authCookie?: *string*
            - **JSON Property** - twoFactorAuth?: *string*
        - **Argument** - OTP Callback?: *function* **(Calls this event asynchronously to get OTP/One Time Password code if needed).**
    - **Function** - Deauthenticate **(Clears internal cache and objects of authentication details).**
- **EventsApi** (Class)
    - **Constructor Argument** - Arguments: *JSON*
        - **JSON Property** - userid?: *string*
        - **JSON Property** - authCookie?: *string*
        - **JSON Property** - twoFactorAuth?: *string*
        - **JSON Property** - debug?: *boolean*
    - **Function** - Connect **(Connects to the Websocket Client to VRChat's backend Websocket Servers with authentication).**
    - **Function** - Disconnect **(Closes websocket connection and removes all event listeners).**
    - **Function** - on **(Subscribe to websocket events and attach handler function).**
        - **Argument** - event: *string*
        - **Argument** - handlerCallback: *function*
- **AuthenticationApi** (Class)
    - **Constructor Argument** - Arguments: *JSON*
        - **JSON Property** - userid?: *string*
        - **JSON Property** - authCookie?: *string*
        - **JSON Property** - twoFactorAuth?: *string*
        - **JSON Property** - debug?: *boolean*
    - **Async Function** - UserExists **(Checks if a user exists on vrchat by using email, username or displayname).**
        - **Argument** - Arguments: *JSON*
            - **JSON Property** - email?: *string*
            - **JSON Property** - username?: *string*
            - **JSON Property** - displayName?: *string*
            - **JSON Property** - excludeUserId?: *string*
    - **Async Function** - Login **(Attempts authentication either by using username and password but prioritizing authCookie for session re-using).**
        - **Argument** - Arguments: *JSON*
            - **JSON Property** - username?: *string*
            - **JSON Property** - password?: *string*
            - **JSON Property** - authCookie?: *string*
            - **JSON Property** - twoFactorAuth?: *string*
    - **Async Function** - GetCurrentUser  **(Returns JSON userObject of the user currently authenticated).**
    - **Async Function** - verifyTotp **(Finishes the login sequence with a normal 2FA-generated code for accounts with 2FA-protection enabled).**
        - **Argument** - authCookie: *string*
        - **Argument** - totp: *string*
    - **Async Function** - verifyOtp **(Finishes the login sequence with an OTP (One Time Password) recovery code for accounts with 2FA-protection enabled).**
        - **Argument** - authCookie: *string*
        - **Argument** - otp: *string*
    - **Async Function** - verifyEmailOtp **(Finishes the login sequence with an 2FA email code).**
        - **Argument** - authCookie: *string*
        - **Argument** - emailotp: *string*
    - **Async Function** - VerifyAuthToken **(Verifies whether provided session token/auth cookie is currently valid). *WILL RETURN ERROR IF AUTHTOKEN IS INVALID EVEN THOUGH NO ERROR HAS OCCURRED!***
        - **Argument** - authCookie: *string*
    - **Async Function** - Logout **(Invalidates currently authenticated session authCookie).**
    - **Function** - GetAuthentication **(Returns JSON object of all credentials required for vrchat's api).**
- **UserApi** (Class)
    - **Constructor Argument** - Arguments: *JSON*
        - **JSON Property** - userid?: *string*
        - **JSON Property** - authCookie?: *string*
        - **JSON Property** - twoFactorAuth?: *string*
        - **JSON Property** - debug?: *boolean*
    - **Async Function** - SearchAllUsers **(Searches for users by displayname).**
        - **Argument** - Arguments: *JSON*
            - **JSON Property** - displayname: *string*
            - **JSON Property** - returnAmount?: *integer*
            - **JSON Property** - offset?: *integer*
    - **Async Function** - GetUserById **(Gets user object by userid).**
        - **Argument** - userid: *string*
    - **Async Function** - UpdateUserInfo **(Updates current user information such as bio and status etc).**
        - **Argument** - Arguments: *JSON*
            - **JSON Property** - email?: *string*
            - **JSON Property** - birthday?: *date*
            - **JSON Property** - tags?: *string array*
            - **JSON Property** - status?: *string*
            - **JSON Property** - statusDescription?: *string*
            - **JSON Property** - bio?: *string*
            - **JSON Property** - bioLinks: *string array*
    - **Async Function** - GetUserGroups **(Gets current users groups).**
    - **Async Function** - GetUserGroupRequests **(Gets current user group requests).**

### **Example Code**
**Before attempting to use this you should have at the least basic knowledge on JSON and asynchronous functions!!**  

Showing examples of everything from using the vrchat class, authentication to every method and how to use them.  
**I strongly recommend against running this code *especially with authentication*, this is a POINT OF REFERENCE ONLY**
```javascript
const { Vrchat, EventType, EventsApi, AuthenticationApi, UsersApi } = require('vrchat-api-library');

async function GetOTP() {
    // Return OTP as string
}

async function Main() {
    const vrchat = new Vrchat();

    // You can provide both username & password and/or authCookie with twoFactorAuth if needed, will use authCookie first, if authCookie invalid will fallback to username & password.
    const auth = await vrchat.Authenticate({
        username: "username",
        password: "securepassword123",
        authCookie: "authCookie",
        twoFactorAuth: "twoFactorAuth string" // NOT OTP CODE
    }, GetOTP); // Provide function **CALLBACK** (can be async/promise) which returns OTP/One Time Password code as a string.

    console.log(auth); // If successful will return user JSON object.

    // EventsApi
    vrchat.Events.Connect();

    vrchat.Events.on(EventType.error, (err) => {
        console.log(err);
    });

    vrchat.Events.on(EventType.friendOnline, (data) => {
        console.log(data);
    });

    // You have full access to all websocket events including non-vrchat events, undocumented event types and you can provide event types as string instead of static EventType
    vrchat.Events.on("open", (data) => {
        console.log(data);
    });

    vrchat.Events.Disconnect();

    // AuthenticationApi
    const authenticationDetails = vrchat.Authentication.GetAuthentication();
    const currentUser = await vrchat.Authentication.GetCurrentUser();

    // !! Mainly intended for manual authentication for when you don't use the Vrchat class, recommend not touching this function unless you are going fully manual. !!
    const authentication = await vrchat.Authentication.Login({ username: "username", password: "password", authCookie: "authCookie", twoFactorAuth: "twoFactorAuth" });

    const invalidationSuccess = await vrchat.Authentication.Logout("authcookie"); // Invalidates authCookie
    const userExists = await vrchat.Authentication.UserExists({ email: "myemail@domain.com", username: "exampleUsername", displayName: "displayName", excludeUserId: "userid" });
    const validCookie = await vrchat.Authentication.VerifyAuthToken("authCookie"); // Returns boolean indiciating validity of authCookie, will always return error if the authCookie is invalid.
    const EmailOTP = await vrchat.Authentication.verifyEmailOtp("authCookie", "EmailOTP Code"); // Verifies EMAIL OTP/One Time Password and generates twoFactorAuth string.
    const OTP = await vrchat.Authentication.verifyOtp("authCookie", "OTP Code"); // Verifies OTP/One Time Password Code and generates twoFactorAuth string.
    const TOTP = await vrchat.Authentication.verifyTotp("authCookie", "TOTP Code"); // Verifies normally generated OTP/One Time Password Code and generates twoFactorAuth string.
    
    // UsersApi
    const userFromId = await vrchat.Users.GetUserById("userid"); // Returns a User JSON object from userId.
    const groupRequests = await vrchat.Users.GetUserGroupRequests(); // Returns array of all user group requests.
    const groups = await vrchat.Users.GetUserGroups(); // Returns array of all groups of currently authenticated user.
    const searchAllUsers = await vrchat.Users.SearchAllUsers({ displayName: "displayName", returnAmount: 2, offset: 0 }); // Returns array of user objects by search query.
    const userInformation = await vrchat.Users.UpdateUserInfo({ email: "email@example.com", birthday: "1970-01-01", tags: [ "tag1", "tag2" ], status: "active", statusDescription: "statusDescription", bio: "example bio", bioLinks: [ "link1", "link2" ] }); // Updates user information.
}
```

### **Changelog**

- v1.0.6
    - Updated & more re-usable header generation and removed the apiKey parameter as it is no longer required.
    - Added typescript declarations file.
    - README markdown updates. (TODO, Changelogs, Disclamers)