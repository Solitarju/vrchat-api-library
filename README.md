# Node VRChat API Library

***Updated docs and readme soon™***

Easy to build Node.JS applications using **vrchat-api-library**!!

Vrchat-api-library is a node library around the VRChat REST API as documented in the [*Unofficial* API docs](https://vrchatapi.github.io/docs/api/).
Currently only 2 out of 15 major parts of the documented API have been developed in this library, but it also includes an undocumented part of VRChat.. **websockets**! allowing for real-time constant communication between clients and VRChat's backend.

This isn't complete yet I will be working on it over time to complete 100% coverage + websockets and maybe OSC, but most importantly I will try to get this updated so it is functional, stable and up to date with VRChat's backend.

### **Installation**
To install this package through node package manager/npm, run this command:
```
npm i vrchat-api-library
```

### **Classes/API Coverage**
- Vrchat
    - A Class designed to handle authentication and manage the rest of the library automatically for you.
- Events/Websockets
    - Highly stable websocket connection for real time user and friend events. **(Tested for extended periods of time at once. 48+ hours)**
    - Custom "user-online" & "user-offline" events.
    - Completely undocumented so expect some missing coverage **(Still functions if you know the event type!)** but completely stable and modular.
- Authentication
    - Re-usable session credentials so you don't get session-limited! (woooh!! yayy!!)
- User
    - Honestly nothing special here, works as intended.

The reasons above are why I personally prefer and think my library works better than others, major parts such as Websockets and re-using session tokens is something you can't do with the un-official library. With just a bit of time to add more coverage and add extra layers of stability and it could be the go-to node library for working with VRChat on the web or applications.

### **Functions**
*Important notice, most arguments in this library are optional and done through json such as vrchat.Authenticate({ username: "username", password: "password" })*  
!!Most functions will return just the straight up JSON response from the network request in the format of { success: boolean, json?: JSON } OR in the case of errors, a HTTP error code in place of the JSON { success: *boolean*, status: *integer* }!!
- **Vrchat** (Class)
    - **Constructor Argument** - debug?: *boolean*
    - **Async Function** - Authenticate **(Takes user details and internally creates new session or uses existing session for later ease of use).**
        - **Argument** - username?: *string*
        - **Argument** - password?: *string*
        - **Argument** - authCookie?: *string*
        - **Argument** - twoFactorAuth?: *string*
    - **Function** - Deauthenticate **(Clears internal cache and objects of authentication details).**
- **Events** (Class)
    - **Constructor Argument** - userid?: *string*
    - **Constructor Argument** - authCookie?: *string*
    - **Constructor Argument** - twoFactorAuth?: *string*
    - **Constructor Argument** - debug?: *boolean*
    - **Function** - Connect **(Connects to the Websocket Client to VRChat's backend Websocket Servers with authentication).**
    - **Function** - Disconnect **(Closes websocket connection and removes all event listeners).**
    - **Function** - on **(Subscribe to websocket events and attach handler function).**
        - **Argument** - event: *string*
        - **Argument** - handlerCallback: *function*
- **Authentication** (Class)
    - **Constructor Argument** - userid?: *string*
    - **Constructor Argument** - authCookie?: *string*
    - **Constructor Argument** - twoFactorAuth?: *string*
    - **Constructor Argument** - debug?: *boolean*
    - **Async Function** - UserExists **(Checks if a user exists on vrchat by using email, username or displayname).**
        - **Argument** - email?: *string*
        - **Argument** - username?: *string*
        - **Argument** - displayName?: *string*
        - **Argument** - excludeUserId?: *string*
    - **Async Function** - Login **(Attempts authentication either by using username and password but prioritizing authCookie for session re-using).**
        - **Argument** - username?: *string*
        - **Argument** - password?: *string*
        - **Argument** - authCookie?: *string*
        - **Argument** - twoFactorAuth?: *string*
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
- **User** (Class)
    - **Constructor Argument** - userid?: *string*
    - **Constructor Argument** - authCookie?: *string*
    - **Constructor Argument** - twoFactorAuth?: *string*
    - **Constructor Argument** - debug?: *boolean*
    - **Async Function** - SearchAllUsers **(Searches for users by displayname).**
        - **Argument** - displayname: *string*
        - **Argument** - returnAmount?: *integer*
        - **Argument** - offset?: *integer*
    - **Async Function** - GetUserById **(Gets user object by userid).**
        - **Argument** - userid: *string*
    - **Async Function** - UpdateUserInfo **(Updates current user information such as bio and status etc).**
        - **Argument** - email?: *string*
        - **Argument** - birthday?: *date*
        - **Argument** - tags?: *string array*
        - **Argument** - status?: *string*
        - **Argument** - statusDescription?: *string*
        - **Argument** - bio?: *string*
        - **Argument** - bioLinks: *string array*
    - **Async Function** - GetUserGroups **(Gets current users groups).**
    - **Async Function** - GetUserGroupRequests **(Gets current user group requests).**

Proper documentations for these classes and methods will come soon! sorry. :P

### **Example Code**
**Before attempting to use this you should have at the least basic knowledge on JSON and asynchronous functions!!**  
Showing examples of everything from using the vrchat class, authentication to every method and how to use them.  

Coming soon.  
