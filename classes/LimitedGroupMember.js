class LimitedGroupMember {

    id = "";
    groupId = "";    
    userId = "";     
    isRepresenting = true;
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

module.exports = { LimitedGroupMember };