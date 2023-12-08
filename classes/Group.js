class Group {

    id = "";
    name = "";
    shortCode = "";
    discriminator = "";
    description = "";
    iconUrl = "";
    bannerUrl = "";
    privacy = "";
    ownerId = "";
    rules = "";
    links = [""];
    languages = [""];
    iconId = "";
    bannerId = "";
    memberCount = 0;
    memberCountSyncedAt = "";
    isVerified = false;
    joinState = "";
    tags = [""];
    galleries = [{"id":"","name":"","description":"","membersOnly":false,"roleIdsToView":[""],"roleIdsToSubmit":[""],"roleIdsToAutoApprove":[""],"roleIdsToManage":[""],"createdAt":"","updatedAt":""}];
    createdAt = "1970-01-01T00:00:00.000Z";
    onlineMemberCount = 0;
    membershipStatus = "member";
    myMember = {"id":"","groupId":"","userId":"","roleIds":[""],"managerNotes":"","membershipStatus":"","isSubscribedToAnnouncements":false,"visibility":"","isRepresenting":false,"joinedAt":"","bannedAt":"","has2FA":false,"permissions":[""]};
    roles = [{"id":"","groupId":"","name":"","description":"","isSelfAssignable":false,"permissions":[""],"isManagementRole":false,"requiresTwoFactor":false,"requiresPurchase":false,"order":0,"createdAt":"","updatedAt":""}];

    // I've found that the Group functions in UsersApi doesn't return this object exactly as specified by the vrchat documentation. Will work on fixing it.

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };
}

module.exports = { Group };