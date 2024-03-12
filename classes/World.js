class World {

    authorId = "";
    authorName = "";
    capacity = 0;
    recommendedCapacity = 0;
    created_at = "";
    description = "";
    favorites = 0;
    featured = false;
    heat = 0;
    id = "";
    imageUrl = "";
    instances = [[null]];
    labsPublicationDate = "";
    name = "";
    namespace = "";
    occupants = 0;
    organization = "";
    popularity = 0;
    previewYoutubeId = "";
    privateOccupants = 0;
    publicOccupants = 0;
    publicationDate = "";
    releaseStatus = "";
    tags = [""];
    thumbnailImageUrl = "";
    unityPackages = [{"assetUrl":"","assetUrlObject":{},"assetVersion":0,"created_at":"","id":"","platform":"","pluginUrl":"","pluginUrlObject":{},"unitySortNumber":0,"unityVersion":""}];
    updated_at = "";
    version = 0;
    visits = 0;

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { World };