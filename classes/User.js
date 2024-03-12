class User {

    allowAvatarCopying = false;
    bio = "";
    bioLinks = [""];
    currentAvatarImageUrl = "";
    currentAvatarThumbnailImageUrl = "";
    date_joined = "";
    developerType = "";
    displayName = "";
    friendKey = "";
    friendRequestStatus = "";
    id = "";
    instanceId = "";
    isFriend = false;
    last_activity = "";
    last_login = "";
    last_platform = "";
    location = "";
    note = "";
    profilePicOverride = "";
    state = "";
    status = "";
    statusDescription = "";
    tags = [""];
    travelingToInstance = "";
    travelingToLocation = "";
    travelingToWorld = "";
    userIcon = "";
    worldId = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };
    
};

module.exports = { User };