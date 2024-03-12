class GroupMember {

    id = "";
    groupId = "";
    userId = "";
    isRepresenting = true;
    user = {"id":"","displayName":"","thumbnailUrl":"","iconUrl":"","profilePicOverride":"","currentAvatarThumbnailImageUrl":"","currentAvatarTags":[""]};
    roleIds = [""];
    mRoleIds = [""];
    joinedAt = "";
    membershipStatus = "";
    visibility = "";
    isSubscribedToAnnouncements = false;
    createdAt = "";
    bannedAt = "";
    managerNotes = "";
    lastPostReadAt = "";
    hasJoinedFromPurchase = false;

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { GroupMember };