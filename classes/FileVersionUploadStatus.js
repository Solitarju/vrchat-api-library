class FileVersionUploadStatus {

    uploadId = "";
    fileName = "";
    nextPartNumber = 0;
    maxParts = 1;
    parts = [];
    etags = [];

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { FileVersionUploadStatus };