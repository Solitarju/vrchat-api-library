class Instance { 

    active = true;
    canRequestInvite = true;
    capacity = 8;
    full = false;
    id = "wrld_ba913a96-fac4-4048-a062-9aa5db092812:12345~hidden(usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469)~region(eu)~nonce(27e8414a-59a0-4f3d-af1f-f27557eb49a2)";
    instanceId = "12345~hidden(usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469)~region(eu)~nonce(27e8414a-59a0-4f3d-af1f-f27557eb49a2)";
    location = "wrld_ba913a96-fac4-4048-a062-9aa5db092812:12345~hidden(usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469)~region(eu)~nonce(27e8414a-59a0-4f3d-af1f-f27557eb49a2)";
    n_users = 6;
    name = "12345";
    ownerId = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    permanent = false;
    photonRegion = "eu";
    platforms = {"android":1,"standalonewindows":5};
    region = "eu";
    secureName = "7eavhhng";
    shortName = "02u7yz8j";
    tags = ["show_social_rank","language_eng","language_jpn"];
    type = "hidden";
    worldId = "wrld_ba913a96-fac4-4048-a062-9aa5db092812";
    hidden = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    friends = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    private = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { Instance };