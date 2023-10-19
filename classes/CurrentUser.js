class CurrentUser {

    acceptedTOSVersion = 7;
    acceptedPrivacyVersion = 0;
    accountDeletionDate = "1970-01-01";
    accountDeletionLog = [
        {
        "message": "Deletion requested",
        "deletionScheduled": "1970-01-01T00:00:00.000Z",
        "dateTime": "1970-01-01T00:00:00.000Z"
        }
    ];
    activeFriends = ["usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469"];
    allowAvatarCopying = false;
    bio = "";
    bioLinks = [""];
    currentAvatar = "avtr_912d66a4-4714-43b8-8407-7de2cafbf55b";
    currentAvatarAssetUrl = "";
    currentAvatarImageUrl = "https://api.vrchat.cloud/api/1/file/file_ae46d521-7281-4b38-b365-804b32a1d6a7/1/file";
    currentAvatarThumbnailImageUrl = "https://api.vrchat.cloud/api/1/image/file_aae83ed9-d42d-4d72-9f4b-9f1e41ed17e1/1/256";
    date_joined = "1970-01-01";
    developerType = "none";
    displayName = "";
    emailVerified = false;
    fallbackAvatar = "avtr_912d66a4-4714-43b8-8407-7de2cafbf55b";
    friendKey = "";
    friends = ["usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469"];
    hasBirthday = false;
    hasEmail = false;
    hasLoggedInFromClient = false;
    hasPendingEmail = false;
    homeLocation = "wrld_ba913a96-fac4-4048-a062-9aa5db092812";
    id = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    isFriend = false;
    last_activity = "1970-01-01T00:00:00.000Z";
    last_login = "1970-01-01T00:00:00.000Z";
    last_platform = "standalonewindows";
    obfuscatedEmail = "";
    obfuscatedPendingEmail = "";
    oculusId = "";
    offlineFriends = ["usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469"];
    onlineFriends = ["usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469"];
    pastDisplayNames = [
        {
            "displayName": "A",
            "updated_at": "1970-01-01T00:00:00.000Z"
        }
    ];
    presence = [
        {
            "avatarThumbnail": "",
            "displayName": "",
            "groups": [
              "grp_71a7ff59-112c-4e78-a990-c7cc650776e5"
            ],
            "id": "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469",
            "instance": "",
            "instanceType": "",
            "isRejoining": "",
            "platform": "",
            "profilePicOverride": "",
            "status": "",
            "travelingToInstance": "",
            "travelingToWorld": "wrld_ba913a96-fac4-4048-a062-9aa5db092812",
            "world": "wrld_ba913a96-fac4-4048-a062-9aa5db092812"
        }
    ];
    profilePicOverride = "";
    state = "offline";
    status = "active";
    statusDescription = "";
    statusFirstTime = false;
    statusHistory = [""];
    steamDetails = [
        {}
    ];
    steamId = "";
    tags = ["A"];
    twoFactorAuthEnabled = false;
    twoFactorAuthEnabledDate = "1970-01-01T00:00:00.000Z";
    unsubscribe = false;
    updated_at = "1970-01-01T00:00:00.000Z";
    userIcon = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

};

module.exports = { CurrentUser };