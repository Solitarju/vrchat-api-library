class Avatar {

    assetUrl = "";
    assetUrlObject = {};
    authorId = "";
    authorName = "";
    created_at = "";
    description = "";
    featured = false;
    id = "";
    imageUrl = "";
    name = "";
    releaseStatus = "";
    tags = [""];
    thumbnailImageUrl = "";
    unityPackageUrl = "";
    unityPackages = [{"assetUrl":"","assetUrlObject":{},"assetVersion":0,"created_at":"","id":"","platform":"","pluginUrl":"","pluginUrlObject":{},"unitySortNumber":0,"unityVersion":""}];
    updated_at = "";
    version = 0;

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { Avatar };