class LimitedWorld {

    authorId = "";
    authorName = "";
    capacity = 0;
    created_at = "";
    favorites = 0;
    heat = 0;
    id = "";
    imageUrl = "";
    labsPublicationDate = "";
    name = "";
    occupants = 0;
    organization = "";
    popularity = 0;
    publicationDate = "";
    releaseStatus = "";
    tags = [""];
    thumbnailImageUrl = "";
    unityPackages = [{"platform":"","unityVersion":""}];
    updated_at = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { LimitedWorld };