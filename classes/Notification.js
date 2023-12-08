class Notification {

    created_at = "";
    details = "";
    id = "";
    message = "";
    seen = false;
    receiverUserId = "";
    senderUserId = "";
    type = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { Notification };