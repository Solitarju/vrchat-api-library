class LimitedWorld {

    authorId = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    authorName = "A";
    capacity = 8;
    created_at = "1970-01-01T00:00:00.000Z";
    favorites = 12024;
    heat = 5;
    id = "wrld_ba913a96-fac4-4048-a062-9aa5db092812";
    imageUrl = "A";
    labsPublicationDate = "none";
    name = "A";
    occupants = 47;
    organization = "A";
    popularity = 8;
    publicationDate = "none";
    releaseStatus = "public";
    tags = ["A"];
    thumbnailImageUrl = "A";
    unityPackages = [{"platform":"standalonewindows","unityVersion":"2018.4.14f1"}];
    updated_at = "1970-01-01T00:00:00.000Z";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { LimitedWorld };