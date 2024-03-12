class GroupRole {

    id = "";
    groupId = "";
    name = "";
    description = "";
    isSelfAssignable = false;
    permissions = [""];
    isManagementRole = false;
    requiresTwoFactor = false;
    requiresPurchase = false;
    order = 0;
    createdAt = "";
    updatedAt = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { GroupRole };