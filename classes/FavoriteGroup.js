class FavoriteGroup {

    displayName = "A";
    id = "fvgrp_8a02a44b-dc3a-4a9a-bc77-77fa37996fc7";   
    name = "A";
    ownerDisplayName = "A";
    ownerId = "usr_c1644b5b-3ca4-45b4-97c6-a2a0de70d469";
    tags = ["A"];
    type = "world";
    visibility = "private";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { FavoriteGroup };