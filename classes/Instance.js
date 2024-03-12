class Instance { 

    active = false;
    canRequestInvite = false;
    capacity = 0;
    full = false;
    id = "";
    instanceId = "";
    location = "";
    n_users = 0;
    name = "";
    ownerId = "";
    permanent = false;
    photonRegion = "";
    platforms = {"android":1,"standalonewindows":5};
    region = "";
    secureName = "";
    shortName = "";
    tags = [""];
    type = "";
    worldId = "";
    hidden = "";
    friends = "";
    private = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { Instance };