class Success {

    success = {
        "message": "Friendship request deleted",
        "status_code": 200
    }

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { Success };