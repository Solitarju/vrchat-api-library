class LimitedUser {

    bio = "";
    currentAvatarImageUrl = "";
    currentAvatarThumbnailImageUrl = "";
    developerType = "";
    displayName = "";
    fallbackAvatar = "";
    id = "";
    isFriend = false;
    last_platform = "";
    profilePicOverride = "";
    status = "";
    statusDescription = "";
    tags = [""];
    userIcon = "";
    location = "";
    friendKey = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

};

module.exports = { LimitedUser };