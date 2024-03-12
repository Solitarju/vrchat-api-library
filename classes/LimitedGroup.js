class LimitedGroup {

    id = "";
    name = "";       
    shortCode = "";  
    discriminator = "";
    description = "";
    iconUrl = "";    
    bannerUrl = "";  
    ownerId = "";
    rules = "";
    iconId = "";
    bannerId = "";
    memberCount = 0;
    tags = [""];
    createdAt = "";
    membershipStatus = "";
    isSearchable = false;
    galleries = [{"id":"","name":"","description":"","membersOnly":false,"roleIdsToView":[""],"roleIdsToSubmit":[""],"roleIdsToAutoApprove":[""],"roleIdsToManage":[""],"createdAt":"","updatedAt":""}];

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }
    
}