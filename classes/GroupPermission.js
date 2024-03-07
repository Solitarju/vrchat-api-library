class GroupPermission {

    name = "";
    displayName = "";
    help = "";
    isManagementPermission = true;
    allowedToAdd = true;

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { GroupPermission };