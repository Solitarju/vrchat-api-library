class World {

    authorId = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    authorName = "A";
    capacity = 8;
    recommendedCapacity = 4;
    created_at = "1970-01-01T00:00:00.000Z";
    description = "string";
    favorites = 12024;
    featured = false;
    heat = 5;
    id = "wrld_ba913a96-fac4-4048-a062-9aa5db092812";
    imageUrl = "A";
    instances = [[null]];
    labsPublicationDate = "none";
    name = "A";
    namespace = "string";
    occupants = 47;
    organization = "A";
    popularity = 8;
    previewYoutubeId = "string";
    privateOccupants = 1;
    publicOccupants = 46;
    publicationDate = "none";
    releaseStatus = "public";
    tags = ["A"];
    thumbnailImageUrl = "A";
    unityPackages = [{"assetUrl":"https://api.vrchat.cloud/api/1/file/file_cd0caa7b-69ba-4715-8dfe-7d667a9d2537/65/file","assetUrlObject":{},"assetVersion":4,"created_at":"2023-10-24T15:22:30.191Z","id":"unp_52b12c39-4163-457d-a4a9-630e7aff1bff","platform":"standalonewindows","pluginUrl":"","pluginUrlObject":{},"unitySortNumber":20180414000,"unityVersion":"2018.4.14f1"}];
    updated_at = "1970-01-01T00:00:00.000Z";
    version = 68;
    visits = 9988675;

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { World };