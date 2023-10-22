class Error {

    ErrorMessage = "";
    HTTPStatus = 418;
    JSON = {};

    constructor(errMessage = "", reqStatus = 418, res = {}) {
        this.ErrorMessage = errMessage;
        this.HTTPStatus = reqStatus;
        this.JSON = res;
    }

}

module.exports = { Error };