class GroupAudit {

    results = [];
    totalCount = 0;
    hasNext = false;

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { GroupAudit };