class GroupGalleryImage {

    id = "";
    groupId = "";
    galleryId = "";
    fileId = "";
    imageUrl = "";
    createdAt = "";
    submittedByUserId = "";
    approved = true;
    approvedByUserId = "";
    approvedAt = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { GroupGalleryImage };