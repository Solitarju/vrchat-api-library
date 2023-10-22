class Group {
    id = "grp_71a7ff59-112c-4e78-a990-c7cc650776e5";
    name = "string";
    shortCode = "ABC123";
    discriminator = "1234";
    description = "string";
    iconUrl = "string";
    bannerUrl = "string";
    privacy = "default";
    ownerId = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    rules = "string";
    links = ["string"];
    languages = ["string"];
    iconId = "string";
    bannerId = "string";
    memberCount = 0;
    memberCountSyncedAt = "1970-01-01T00:00:00.000Z";
    isVerified = false;
    joinState = "closed";
    tags = ["A"];
    galleries = [{"id":"ggal_a03a4b55-4ca6-4490-9519-40ba6351a233","name":"Example Gallery","description":"Example Description","membersOnly":false,"roleIdsToView":["grol_459d3911-f672-44bc-b84d-e54ffe7960fe"],"roleIdsToSubmit":["grol_459d3911-f672-44bc-b84d-e54ffe7960fe"],"roleIdsToAutoApprove":["grol_459d3911-f672-44bc-b84d-e54ffe7960fe"],"roleIdsToManage":["grol_459d3911-f672-44bc-b84d-e54ffe7960fe"],"createdAt":"1970-01-01T00:00:00.000Z","updatedAt":"1970-01-01T00:00:00.000Z"}];
    createdAt = "1970-01-01T00:00:00.000Z";
    onlineMemberCount = 0;
    membershipStatus = "member";
    myMember = {"id":"gmem_95cdb3b4-4643-4eb6-bdab-46a4e1e5ce37","groupId":"grp_71a7ff59-112c-4e78-a990-c7cc650776e5","userId":"usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469","roleIds":["grol_459d3911-f672-44bc-b84d-e54ffe7960fe"],"managerNotes":"string","membershipStatus":"member","isSubscribedToAnnouncements":false,"visibility":"visible","isRepresenting":false,"joinedAt":"1970-01-01T00:00:00.000Z","bannedAt":"string","has2FA":false,"permissions":["group-instance-join"]};
    roles = [{"id":"grol_459d3911-f672-44bc-b84d-e54ffe7960fe","groupId":"grp_71a7ff59-112c-4e78-a990-c7cc650776e5","name":"string","description":"string","isSelfAssignable":false,"permissions":["string"],"isManagementRole":false,"requiresTwoFactor":false,"requiresPurchase":false,"order":0,"createdAt":"1970-01-01T00:00:00.000Z","updatedAt":"1970-01-01T00:00:00.000Z"}];

    // I've found that the Group functions in UsersApi doesn't return this object exactly as specified by the vrchat documentation. Will work on fixing it.

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };
}

module.exports = { Group };