class InfoPush {

    id = "";
    isEnabled = true;
    releaseStatus = "";
    priority = 970;
    tags = [];
    data = {};
    hash = "";
    createdAt = "";
    updatedAt = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { InfoPush };