class User {

    allowAvatarCopying = false;
    bio = "AAAAAA";
    bioLinks = [
      ""
    ];
    currentAvatarImageUrl = "https://api.vrchat.cloud/api/1/file/file_ae46d521-7281-4b38-b365-804b32a1d6a7/1/file";
    currentAvatarThumbnailImageUrl = "https://api.vrchat.cloud/api/1/image/file_aae83ed9-d42d-4d72-9f4b-9f1e41ed17e1/1/256";
    date_joined = "1970-01-01";
    developerType = "none";
    displayName = "";
    friendKey = "";
    friendRequestStatus = "";
    id = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    instanceId = "wrld_ba913a96-fac4-4048-a062-9aa5db092812:12345~hidden(usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469)~region(eu)~nonce(27e8414a-59a0-4f3d-af1f-f27557eb49a2)";
    isFriend = false;
    last_activity = "";
    last_login = "";
    last_platform = "standalonewindows";
    location = "wrld_ba913a96-fac4-4048-a062-9aa5db092812";
    note = "";
    profilePicOverride = "";
    state = "offline";
    status = "active";
    statusDescription = "";
    tags = [
      "A"
    ];
    travelingToInstance = "";
    travelingToLocation = "";
    travelingToWorld = "";
    userIcon = "";
    worldId = "wrld_ba913a96-fac4-4048-a062-9aa5db092812";

    constructor(userObject = {}) {
        if(!Object.keys(userObject).length > 0) return this;
        Object.keys(userObject).forEach(element => {
            this[element] = userObject[element];
        });
    }
}

module.exports = { User };