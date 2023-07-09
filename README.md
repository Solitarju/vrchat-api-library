# VRChat API Library
[Join the Discord server for support or any other inqueries!](https://discord.gg/cfdjj7TbaF)

Easy VRChat integration to your Node.JS applications using [vrchat-api-library](https://www.npmjs.com/package/vrchat-api-library), also with realtime events using websockets!  
Built according to the [**Unofficial VRChat API Docs**](https://vrchatapi.github.io/docs/api/).

- [Disclaimer](#disclaimer)
- [Installation](#installation)  
- [Getting Started](#getting-started)
- [Classes/API Coverage](#classesapi-coverage)
- [Usage](#usage)
- [TODO](#todo)
- [Changelog](#changelog)

### **Disclaimer**  *(From the community driven VRChat API docs)*
Use of the API using applications other than the approved methods (website, VRChat application) are not officially supported. You may use the API for your own application, but keep these guidelines in mind:

- We do not provide documentation or support for the API.
- Do not make queries to the API more than once per 60 seconds.
- Abuse of the API may result in account termination.
- Access to API endpoints may break at any given time, with no warning.

### **Installation**
Install via npm using:
```
npm install vrchat-api-library
```

### **Getting Started**  

```javascript
const { VRChat, EventsApi, AuthenticationApi, AvatarsApi, EconomyApi, FavoritesApi, FilesApi, FriendsApi, GroupsApi, InviteApi, InstancesApi, NotificationsApi, PermissionsApi, PlayerModerationApi, SystemApi, UsersApi, WorldsApi, Enums } = require('vrchat-api-library'); // Require the classes you need, or all of them.

async function GetOTP() {
    // Return OTP/One Time Password as string
}

async function Main() {
    // NOTE: Some functions may be used without authentication, but the majority will throw a 401 (Unauthorized/Invalid Credentials) HTTP Error.
    const vrchat = new VRChat(); // Create VRChat object.

    // You can provide both username & password and/or authCookie with twoFactorAuth if needed, will use authCookie first, if authCookie invalid will fallback to username & password.
    const auth = await vrchat.Authenticate({
        username: "username",
        password: "securepassword123",
        authCookie: "authCookie",
        twoFactorAuth: "twoFactorAuth string" // NOT OTP CODE
    }, GetOTP); // Provide function **CALLBACK** (can and should be async/promise) which returns OTP/One Time Password code as a string. (Is only called if code is required.)

    console.log(auth); // If successful will return user JSON object.

    // Now all the Api objects inside your VRVhat object will be automatically authenticated as long as authentication was successful.
    // List of all the classes that have authentication automatically handled under the "VRChat" class below.

    // See below for usage details.
    vrchat.EventsApi

    // https://vrchatapi.github.io/docs/api/#get-/auth/exists
    vrchat.AuthenticationApi

    // https://vrchatapi.github.io/docs/api/#get-/users/-userId-/avatar
    vrchat.AvatarsApi

    // https://vrchatapi.github.io/docs/api/#get-/Steam/transactions
    vrchat.EconomyApi

    // https://vrchatapi.github.io/docs/api/#get-/favorites
    vrchat.FavoritesApi

    // https://vrchatapi.github.io/docs/api/#get-/files
    vrchat.FilesApi

    // https://vrchatapi.github.io/docs/api/#get-/auth/user/friends
    vrchat.FriendsApi

    // https://vrchatapi.github.io/docs/api/#post-/groups
    vrchat.GroupsApi

    // https://vrchatapi.github.io/docs/api/#post-/invite/-userId-
    vrchat.InvitesApi

    // https://vrchatapi.github.io/docs/api/#get-/instances/-worldId---instanceId-
    vrchat.InstancesApi

    // https://vrchatapi.github.io/docs/api/#get-/auth/user/notifications
    vrchat.NotificationsApi

    // https://vrchatapi.github.io/docs/api/#get-/auth/permissions
    vrchat.PermissionsApi

    // https://vrchatapi.github.io/docs/api/#get-/auth/user/playermoderations
    vrchat.PlayerModerationApi

    // https://vrchatapi.github.io/docs/api/#get-/config
    vrchat.SystemApi // SystemApi doesn't require authentication but it's still under the VRChat class, you can use it either way inside or outside the manager class.

    // https://vrchatapi.github.io/docs/api/#get-/users
    vrchat.UsersApi

    // https://vrchatapi.github.io/docs/api/#get-/worlds
    vrchat.WorldsApi
}
```

### **Usage**  
This should give enough information to get started with pretty much all points of the API, although if you find yourself needed further assistance don't hesitate to join the discord.
```javascript
// Require the necessary vrchat-api-library classes
const { VRChat, EventsApi, AuthenticationApi, AvatarsApi, EconomyApi, FavoritesApi, FilesApi, FriendsApi, GroupsApi, InviteApi, InstancesApi, NotificationsApi, PermissionsApi, PlayerModerationApi, SystemApi, UsersApi, WorldsApi, Enums } = require('vrchat-api-library');

async function GetOTP() {
    // Return OTP/One Time Password as string
}

// NOTE: Some functions may be used without authentication, but the majority will throw a 401 (Unauthorized/Invalid Credentials) HTTP Error.
const vrchat = new VRChat(); // Create VRChat object.

// You can provide both username & password and/or authCookie with twoFactorAuth if needed, will use authCookie first, if authCookie invalid will fallback to username & password.
const auth = await vrchat.Authenticate({
    username: "username",
    password: "securepassword123",
    authCookie: "authCookie",
    twoFactorAuth: "twoFactorAuth string" // NOT OTP CODE
}, GetOTP); // Provide function **CALLBACK** (can and should be async/promise) which returns OTP/One Time Password code as a string. (Is only called if code is required.)

// Events Usage
// Connect once authenticated.
vrchat.EventsApi.Connect();

/*
 *  Listen to error event, useful for connection errors. This is not a vrchat event but an event of the websocket itself, you can replace the Enum eventType
 *  with any eventType you want as a string e.g. "ping" or "open" etc.
 */
vrchat.EventsApi.on(Enums.EventType.error, (err) => {
    console.log("Error: " + err.message);
});

/* 
    Listen for vrchat events, you can find all discovered ones under Enums.EventType. If an undiscovered one is detected, it will be sent to the console and if you wish to use 
    it, you can pass is as a string in place of where the Enum would normally go.
 */
vrchat.EventsApi.on(Enums.EventType.friendOnline, (data) => {
    console.log("Friend online: " + JSON.stringify(data));
});

// Disconnect from websocket once connection is no longer needed.
vrchat.EventsApi.Disconnect();


// Regular API usage. (Below)

// NOTES:
// !! Most functions are async, the only exceptions are the EventsApi and the getAuthentication method under the AuthenticationApi class.
// !! Most functions will take a JSON object for arguments, the only exception is when there are no optional arguments or there is only one argument.

// Log the publish status of this world id, only one argument so it doesn't take JSON. Note how the function is async.
console.log(await vrchat.WorldsApi.GetWorldPublishStatus("wrld_1b68f7a8-8aea-4900-b7a2-3fc4139ac817"));

/*
 Get an array of user objects on your friends list, note how this time you use JSON arguments as at least one argument is optional and again paying
 attention to it being async.
*/
console.log(await vrchat.FriendsApi.ListFriends({ n: 100, offline: true }));

/*
 Get all details required to authenticate (token, twofactorauth), also returns the userid although that is not needed. Note how this function is not async as it makes
 no network requests.
*/
console.log(vrchat.AuthenticationApi.GetAuthentication());
```

### **Classes/API Coverage**
- Class: **VRChat**
    - A Class designed to handle authentication and manage the rest of the library automatically for you.
- Class: **EventsApi**
    - Highly stable websocket connection for real time user and friend events. **(Tested for multiple extended periods of time. 48+ hours straight)**
    - Custom "user-online" & "user-offline" events.
    - Completely undocumented so expect some missing coverage **(Still functions if you know the event type, you can just pass it as a string)** but completely stable and modular.
- Class: **AuthenticationApi**
    - Reusable session credentials so you don't get session limited.
- Class: **AvatarsApi**
- Class: **EconomyApi**
- Class: **FavoritesApi**
- Class: **FilesApi**
- Class: **FriendsApi**
- Class: **GroupsApi**
- Class: **InvitesApi**
- Class: **InstancesApi**
- Class: **NotificationsApi**
- Class: **PermissionsApi**
- Class: **PlayerModerationApi**
- Class: **SystemApi**
- Class: **UsersApi**
- Class: **WorldsApi**
- Class: **Enums**
    - Enums class containing all enum types.

### **TODO**
- (Important) Optional argument fixes. (If a falsy value is passed, the function will omit that value and not specify it in the api request resulting in it returning to default instead).
- Wiki/Documentation.
- Consistency improvements.
- Separate classes into their own modules for better organization.
- User Class instead of raw JSON.
- OSC (Potentially).

### **Changelog**
- v1.2.0
    - Finally completed 100% API coverage!
    - Renamed "Vrchat" manager class to "VRChat".

- v1.1.0
    - Simple fix for pretty major authentication bug on "Vrchat" manager class.
    
- v1.0.9
    - Added functionality for FriendsApi, WorldsApi & AvatarsApi to an extent.
    - Renamed classes to include 'Api' such as 'AuthenticationApi' including managed classes under the 'Vrchat' class.
    - Moved all Enums to a single class for better organization, EventType class is now under Enums class and not usable in the same way as before.
    - More markdown changes.

- v1.0.8
    - Added the last changelog version since I got carried away in markdown and forgot.
    - Removed typescript declarations because it removes auto-complete/intellisense and completely broke me for an hour trying to work out what was broken.
    - Reverted exports change.

- v1.0.7
    - Markdown changes last second lmao.

- v1.0.6
    - Updated & more re-usable header generation and removed the apiKey parameter as it is no longer required.
    - Added typescript declarations file.
    - README markdown updates. (TODO, Changelogs, Disclamers)