class GroupGallery {

    id = "";
    name = "";
    description = "";
    membersOnly = false;
    roleIdsToView = [""];
    roleIdsToSubmit = [""];
    roleIdsToAutoApprove = [""];
    roleIdsToManage = [""];
    createdAt = "";
    updatedAt = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { GroupGallery };