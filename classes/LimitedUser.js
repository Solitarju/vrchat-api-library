class LimitedUser {

    bio = "";
    currentAvatarImageUrl = "https://api.vrchat.cloud/api/1/file/file_ae46d521-7281-4b38-b365-804b32a1d6a7/1/file";
    currentAvatarThumbnailImageUrl = "https://api.vrchat.cloud/api/1/image/file_aae83ed9-d42d-4d72-9f4b-9f1e41ed17e1/1/256";
    developerType = "none";
    displayName = "";
    fallbackAvatar = "avtr_912d66a4-4714-43b8-8407-7de2cafbf55b";
    id = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    isFriend = false;
    last_platform = "standalonewindows";
    profilePicOverride = "";
    status = "active";
    statusDescription = "";
    tags = ["A"];
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