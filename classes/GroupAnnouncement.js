class GroupAnnouncement {

    id = "";
    groupId = "";
    authorId = "";
    title = "";
    text = "";
    imageId = "";
    imageUrl = "";
    createdAt = "";
    updatedAt = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { GroupAnnouncement };