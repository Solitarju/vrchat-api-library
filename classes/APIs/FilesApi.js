const File = require('../File.js');
const Error = require('../Error.js');
const Util = require('../Util.js');

class FilesApi {

    #fetch;
    #UserAgent;

    #APIEndpoint = "https://api.vrchat.cloud/api/1";
    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug = false;

    #GenerateParameters;

    constructor({ userid = "", authCookie = "", twoFactorAuth = "", debug = false} = {}, fetch, UserAgent) {
        this.#fetch = fetch;
        this.#UserAgent = UserAgent;
        this.#GenerateParameters = Util.GenerateParameters;
        if(!authCookie.length > 0) return this;

        this.#userid = userid;
        this.#authCookie = authCookie;
        this.#twoFactorAuth = twoFactorAuth;
        this.#debug = debug;
    }

    #Debug(x) {
        if(!this.#debug === true) return;
        console.log(x);
    }

    #GenerateHeaders(authentication = false, contentType = "") {
        var headers = new this.#fetch.Headers({
            "User-Agent": this.#UserAgent,
            "cookie": `${this.#authCookie && authentication ? "auth=" + this.#authCookie + "; " : ""}${this.#twoFactorAuth && authentication ? "twoFactorAuth=" + this.#twoFactorAuth + "; " : ""}`
        });

        if(contentType) headers.set('Content-Type', contentType);
        return headers;
    }

    /**
     * 
     * Returns a list of files.
     * 
     * @returns {Promise<Array<File>>} Returns an array of File objects.
     */
    async ListFiles({ tag = "", n = 60, offset = 0 } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const params = this.#GenerateParameters({ tag, n, offset });
        const res = await this.#fetch(`${this.#APIEndpoint}/files${params ? "?" + params : ""}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        let returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new File(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Creates a new File object.
     * 
     * @returns {Promise<File>} Returns a single File object.
     */
    async CreateFile({ name = "", mimeType = "", extension = "", tags = [] } = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!name || !mimeType || !extension) return new Error("Required Argument(s): name, mimeType, extension", 400, {});

        const bodyData = { name, mimeType, extension };
        if(tags.length > 0) bodyData.tags = tags;

        const res = await this.#fetch(`${this.#APIEndpoint}/file`, { method: 'POST', body: JSON.stringify(bodyData), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new File(json);
    }

    /**
     * 
     * Shows general information about the "File" object. Each File can have several "Version"'s, and each Version can have multiple real files or "Data" blobs.
     * 
     * @returns {Promise<File>} Returns a single File object.
     */
    async ShowFile(fileId = "") {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!fileId) return new Error("Required Argument: fileId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/file/${fileId}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new File(json);
    }

    /**
     * 
     * Creates a new FileVersion. Once a Version has been created, proceed to the /file/{fileId}/{versionId}/file/start endpoint to start a file upload.
     * 
     * @returns {Promise<JSON>}
     */
    async CreateFileVersion({ fileId = "", signatureMd5 = "", signatureSizeInBytes = 0, fileMd5 = "", fileSizeInBytes = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !signatureMd5 || !signatureSizeInBytes) return { success: false, status: 400 };

        const bodyData = { signatureMd5, signatureSizeInBytes };
        if(fileMd5) bodyData.fileMd5 = fileMd5;
        if(fileSizeInBytes) bodyData.fileSizeInBytes = fileSizeInBytes;

        const res = await this.#fetch(`${this.#APIEndpoint}/file/${fileId}`, { method: 'POST', body: JSON.stringify(bodyData), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes a File object.
     * 
     * @returns {Promise<JSON>}
     */
    async DeleteFile(fileId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/file/${fileId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Downloads the file with the provided version number. (Please read extra notes here https://vrchatapi.github.io/docs/api/#get-/favorites/-favoriteId-)
     * 
     * @returns {Promise<JSON>}
     */
    async DownloadFileVersion(fileId = "", versionId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !versionId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/file/${fileId}/${versionId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Delete a specific version of a file. You can only delete the latest version.
     * 
     * @returns {Promise<JSON>}
     */
    async DeleteFileVersion(fileId = "", versionId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !versionId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/file/${fileId}/${versionId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Finish an upload of a FileData. This will mark it as "complete". After uploading the file for Avatars and Worlds you then have to upload a signature file.
     * 
     * @returns {Promise<JSON>}
     */
    async FinishFileDataUpload({fileId = "", versionId = "", fileType = "", etags = []} = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !versionId || !fileType) return { success: false, status: 400 };

        const bodyData = etags.length > 0 ? { etags } : "";
        const res = await this.#fetch(`${this.#APIEndpoint}/file/${fileId}/${versionId}/${fileType}/finish`, { method: 'PUT', body: bodyData ? JSON.stringify(bodyData) : "", headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Starts an upload of a specific FilePart. This endpoint will return an AWS URL which you can PUT data to. You need to call this and receive a new AWS API URL for each partNumber. Please see AWS's REST documentation on "PUT Object to S3" on how to upload. Once all parts have been uploaded, proceed to /finish endpoint.
     * 
     * @returns {Promise<JSON>}
     */
    async StartFileDataUpload(fileId = "", versionId = "", fileType = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !versionId || !fileType) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/file/${fileId}/${versionId}/${fileType}/start`, { method: 'PUT', headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Retrieves the upload status for file upload. Can currently only be accessed when status is waiting. Trying to access it on a file version already uploaded currently times out.
     * 
     * @returns {Promise<JSON>}
     */
    async CheckFileDataUploadStatus(fileId = "", versionId = "", fileType = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!fileId || !versionId || !fileType) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/file/${fileId}/${versionId}/${fileType}/status`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

module.exports = { FilesApi };