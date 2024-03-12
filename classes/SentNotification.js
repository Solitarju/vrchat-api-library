class SentNotification {

    id = "";
    recieverUserId = "";
    senderUserId = "";
    type = "";
    message = "";
    details = "";
    created_at = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { SentNotification };