class CurrentUser {

    acceptedTOSVersion = 0;
    acceptedPrivacyVersion = 0;
    accountDeletionDate = "";
    accountDeletionLog = [
        {
        "message": "",
        "deletionScheduled": "",
        "dateTime": ""
        }
    ];
    activeFriends = [""];
    allowAvatarCopying = false;
    bio = "";
    bioLinks = [""];
    currentAvatar = "";
    currentAvatarAssetUrl = "";
    currentAvatarImageUrl = "";
    currentAvatarThumbnailImageUrl = "";
    date_joined = "";
    developerType = "";
    displayName = "";
    emailVerified = false;
    fallbackAvatar = "";
    friendKey = "";
    friends = [""];
    hasBirthday = false;
    hasEmail = false;
    hasLoggedInFromClient = false;
    hasPendingEmail = false;
    homeLocation = "";
    id = "";
    isFriend = false;
    last_activity = "";
    last_login = "";
    last_platform = "";
    obfuscatedEmail = "";
    obfuscatedPendingEmail = "";
    oculusId = "";
    offlineFriends = [""];
    onlineFriends = [""];
    pastDisplayNames = [
        {
            "displayName": "",
            "updated_at": ""
        }
    ];
    presence = [
        {
            "avatarThumbnail": "",
            "displayName": "",
            "groups": [
              ""
            ],
            "id": "",
            "instance": "",
            "instanceType": "",
            "isRejoining": "",
            "platform": "",
            "profilePicOverride": "",
            "status": "",
            "travelingToInstance": "",
            "travelingToWorld": "",
            "world": ""
        }
    ];
    profilePicOverride = "";
    state = "";
    status = "";
    statusDescription = "";
    statusFirstTime = false;
    statusHistory = [""];
    steamDetails = [
        {}
    ];
    steamId = "";
    tags = [""];
    twoFactorAuthEnabled = false;
    twoFactorAuthEnabledDate = "";
    unsubscribe = false;
    updated_at = "";
    userIcon = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

};

module.exports = { CurrentUser };