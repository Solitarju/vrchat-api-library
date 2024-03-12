class UserSubscription {

    id = "";
    transactionId = "";
    store = "";
    steamItemId = "";
    amount = 0;
    description = "";
    period = "";
    tier = 0;
    active = false;
    status = "";
    expires = "";
    created_at = "";
    updated_at = "";
    licenseGroups = [""];
    isGift = false;


    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { UserSubscription };