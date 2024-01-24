class File {

    extension = "";
    id = "";
    mimeType = "";
    name = "";
    ownerId = "";
    tags = [""];
    versions = [{"created_at":"","deleted":false,"delta":{"category":"","fileName":"","md5":"","sizeInBytes":0,"status":"","uploadId":"","url":""},"file":{"category":"","fileName":"","md5":"","sizeInBytes":0,"status":"","uploadId":"","url":""},"signature":{"category":"","fileName":"","md5":"","sizeInBytes":0,"status":"","uploadId":"","url":""},"status":"","version":0}];

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { File };