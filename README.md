# Node VRChat API Library
[Join the Discord server for support or any other inqueries!](https://discord.gg/cfdjj7TbaF)

Easy to build Node.JS applications using [vrchat-api-library](https://www.npmjs.com/package/vrchat-api-library).

- [Disclaimer](#disclaimer)
- [Installation](#installation)  
- [Getting Started](#getting-started)
- [Classes/API Coverage](#classesapi-coverage)
- [Usage Examples](#example-code)
- [TODO](#todo)

**Built according to the [Unofficial VRChat API Docs](https://vrchatapi.github.io/docs/api/)**.  

Currently only 5 out of 15 major parts of the documented API have been developed in this library, but it also includes **websockets** allowing for real-time constant communication between clients and VRChat's backend.  
(Some parts of the implemented API are still missing such as some put/post/delete endpoints)

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

**!!! EVENTTYPE CLASS HAS BEEN MOVED UNDER ENUM CLASS FOR BETTER ENUM MANAGEMENT IN ADDING MORE ENUMS !!!**

```javascript
const { Vrchat, EventsApi, AuthenticationApi, UsersApi, FriendsApi, WorldsApi, AvatarsApi, Enums } = require('vrchat-api-library'); // Require the classes you need, or all of them.

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
    // Managed EventsApi
    vrchat.EventsApi

    // Managed AuthenticationApi
    vrchat.AuthenticationApi

    // Managed UsersApi
    vrchat.UsersApi

    // Managed FriendsApi
    vrchat.FriendsApi

    // Managed WorldsApi
    vrchat.WorldsApi

    // Managed AvatarsApi
    vrchat.AvatarsApi
}
```

### **Classes/API Coverage**
- Class: **Vrchat**
    - A Class designed to handle authentication and manage the rest of the library automatically for you.
- Class: **EventsApi**
    - Highly stable websocket connection for real time user and friend events. **(Tested for extended periods of time. 48+ hours straight)**
    - Custom "user-online" & "user-offline" events.
    - Completely undocumented so expect some missing coverage **(Still functions if you know the event type, you can just pass it as a string)** but completely stable and modular.
- Class: **AuthenticationApi**
    - Reusable session credentials so you don't get session limited.
- Class: **UsersApi**
    - Honestly nothing special here, works as intended.
- Class: **FriendsApi**
    - Implemented all GET endpoints for this Api only.
- Class: **WorldsApi**
    - Implemented all GET endpoints for this Api only.
- Class: **AvatarsApi**
    - Implemented all GET endpoints for this Api only.
- Class: **Enums**
    - Enums class containing all enum types.

### **Example Code**
**Before attempting to use this you should have at the least basic knowledge on JSON and asynchronous functions!!**  

Showing examples of everything from using the vrchat class, authentication to every method and how to use them.  
**I strongly recommend against running this code *especially with authentication*, this is a POINT OF REFERENCE ONLY**
```javascript
const { Vrchat, EventsApi, AuthenticationApi, UsersApi, FriendsApi, WorldsApi, AvatarsApi, Enums } = require('vrchat-api-library');

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
    vrchat.EventsApi.Connect();

    vrchat.EventsApi.on(Enums.EventType.error, (err) => {
        console.log(err);
    });

    vrchat.EventsApi.on(Enums.EventType.friendOnline, (data) => {
        console.log(data);
    });

    // You have full access to all websocket events including non-vrchat events, undocumented event types and you can provide event types as string instead of static EventType
    vrchat.EventsApi.on("open", (data) => {
        console.log(data);
    });

    vrchat.EventsApi.Disconnect();

    // AuthenticationApi
    const authenticationDetails = vrchat.AuthenticationApi.GetAuthentication();
    const currentUser = await vrchat.AuthenticationApi.GetCurrentUser();

    // !! Mainly intended for manual authentication for when you don't use the Vrchat class, recommend not touching this function unless you are going fully manual. !!
    const authentication = await vrchat.AuthenticationApi.Login({ username: "username", password: "password", authCookie: "authCookie", twoFactorAuth: "twoFactorAuth" });

    const invalidationSuccess = await vrchat.AuthenticationApi.Logout("authcookie"); // Invalidates authCookie
    const userExists = await vrchat.AuthenticationApi.UserExists({ email: "myemail@domain.com", username: "exampleUsername", displayName: "displayName", excludeUserId: "userid" });
    const validCookie = await vrchat.AuthenticationApi.VerifyAuthToken("authCookie"); // Returns boolean indiciating validity of authCookie, will always return error if the authCookie is invalid.
    const EmailOTP = await vrchat.AuthenticationApi.verifyEmailOtp("authCookie", "EmailOTP Code"); // Verifies EMAIL OTP/One Time Password and generates twoFactorAuth string.
    const OTP = await vrchat.AuthenticationApi.verifyOtp("authCookie", "OTP Code"); // Verifies OTP/One Time Password Code and generates twoFactorAuth string.
    const TOTP = await vrchat.AuthenticationApi.verifyTotp("authCookie", "TOTP Code"); // Verifies normally generated OTP/One Time Password Code and generates twoFactorAuth string.
    
    // UsersApi
    const userFromId = await vrchat.UsersApi.GetUserById("userid"); // Returns a User JSON object from userId.
    const groupRequests = await vrchat.UsersApi.GetUserGroupRequests(); // Returns array of all user group requests.
    const groups = await vrchat.UsersApi.GetUserGroups(); // Returns array of all groups of currently authenticated user.
    const searchAllUsers = await vrchat.UsersApi.SearchAllUsers({ displayName: "displayName", returnAmount: 2, offset: 0 }); // Returns array of user objects by search query.
    const userInformation = await vrchat.UsersApi.UpdateUserInfo({ email: "email@example.com", birthday: "1970-01-01", tags: [ "tag1", "tag2" ], status: "active", statusDescription: "statusDescription", bio: "example bio", bioLinks: [ "link1", "link2" ] }); // Updates user information.

    // FriendsApi
    const friendStatus = await vrchat.FriendsApi.CheckFriendStatus("usr_803eb12d-3156-4fad-873a-963dfa0d4a93");
    const listFriends = await vrchat.FriendsApi.ListFriends({ offset: 0, n: 60, offline: false }); // n paramater is the amount to return, n means the same on all objects.

    // WorldsApi
    const worldFromId = await vrchat.WorldsApi.GetWorldById("wrld_9da1349e-470b-47fd-a9b5-bd57d49255e2");
    const instanceFromId = await vrchat.WorldsApi.GetWorldInstance("wrld_9da1349e-470b-47fd-a9b5-bd57d49255e2", "57204");
    const listWorlds = await vrchat.WorldsApi.ListActiveWorlds({ featured: true, sort: Enums.QuerySort.heat, n: 100 });
    const listFavouriteWorlds = await vrchat.WorldsApi.ListFavouritedWorlds({ featured: false, sort: Enums.QuerySort.popularity });
    const listRecentWorlds = await vrchat.WorldsApi.ListRecentWorlds({ tag: "idk, meow, tag" });
    const searchAllWorlds = await vrchat.WorldsApi.SearchAllWorlds({ featured: true, tag: "chill, pens", order: Enums.QueryOrder.descending });

    // AvatarsApi
    const getAvatar = await vrchat.AvatarsApi.GetAvatar("avtr_b90845cc-1695-45d2-8a8c-8eaa77b272c7");
    const currentAvatar = await vrchat.AvatarsApi.GetOwnAvatar();
    const listFavouritedAvatars = await vrchat.AvatarsApi.ListFavouritedAvatars({ featured: false, n: 17, offset: 2 });
    const SearchAllAvatars = await vrchat.AvatarsApi.SearchAllAvatars({ featured: true });
}
```

### **TODO**
- 100% Coverage of the API documented on the [Unofficial API Docs](https://vrchatapi.github.io/docs/api/).
- User Class instead of raw JSON.
- OSC (Potentially).

### **Changelog**
- v1.1.0
    - Simple fix for pretty major authentication bug on "Vrchat" manager class.
    
- v1.0.9
    - Added functionality for FriendsApi, WorldsApi & AvatarsApi to an extent.
    - Renamed classes to include 'Api' such as 'AuthenticationApi' including managed classes under the 'Vrchat' class.
    - Moved all Enums to a single class for better organization, EventType class is now under Enums class and not usable in the same way as before.
    - More markdown changes. (boringgg)

- v1.0.8
    - Added the last changelog version since I got carried away in markdown and forgot.
    - Removed typescript declarations because it removes auto-complete/intellisense and completely broke me for an hour trying to work out what was broken.
    - Changed exports back.
    - Help. (joking)

- v1.0.7
    - Markdown changes last second lmao.

- v1.0.6
    - Updated & more re-usable header generation and removed the apiKey parameter as it is no longer required.
    - Added typescript declarations file.
    - README markdown updates. (TODO, Changelogs, Disclamers)