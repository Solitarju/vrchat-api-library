class InviteMessage {

    canBeUpdated = false;
    id = "";
    message = "";
    messageType = "";
    remainingCooldownMinutes = 0;
    slot = 0;
    updatedAt = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { InviteMessage };