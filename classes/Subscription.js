class Subscription {

    id = "";
    steamItemId = "";
    amount = 0;
    description = "";
    period = "";
    tier = 0;

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { Subscription };