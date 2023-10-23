class Notification {

    created_at = "1970-01-01T00:00:00.000Z";
    details = "OneOf: {}, NotificationDetailInvite, NotificationDetailInviteResponse, NotificationDetailRequestInvite, NotificationDetailRequestInviteResponse, NotificationDetailVoteToKick";
    id = "A";
    message = "This is a generated invite to VRChat Hub";
    seen = false;
    receiverUserId = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    senderUserId = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    type = "friendRequest";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { Notification };