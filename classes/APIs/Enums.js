class EventType {

    static userOnline = new EventType('user-online');
    static userUpdate = new EventType('user-update');
    static userLocation = new EventType('user-location');
    static userOffline = new EventType('user-offline');
    static friendOnline = new EventType('friend-online');
    static friendActive = new EventType('friend-active');
    static friendUpdate = new EventType('friend-update');
    static friendLocation = new EventType('friend-location');
    static friendOffline = new EventType('friend-offline');
    static friendAdd = new EventType('friend-add');
    static friendDelete = new EventType('friend-delete');
    static notification = new EventType('notification');
    static showNotification = new EventType('show-notification');
    static hideNotification = new EventType('hide-notification');
    static error = new EventType('error');

    constructor(type) {
        this.type = type;
    }
}

class QueryOrder {

    static ascending = new QueryOrder("ascending");
    static descending = new QueryOrder("descending");

    constructor(type) {
        this.type = type;
    }
}

class QuerySort {

    static popularity = new QuerySort("popularity");
    static heat = new QuerySort("heat");
    static trust = new QuerySort("trust");
    static shuffle = new QuerySort("shuffle");
    static random = new QuerySort("random");
    static favorites = new QuerySort("favorites");
    static reportScore = new QuerySort("reportScore");
    static reportCount = new QuerySort("reportCount");
    static publicationDate = new QuerySort("publicationDate");
    static labsPublicationDate = new QuerySort("labsPublicationDate");
    static created = new QuerySort("created");
    static _created_at = new QuerySort("_created_at");
    static updated = new QuerySort("updated");
    static _updated_at = new QuerySort("_updated_at");
    static order = new QuerySort("order");
    static relevance = new QuerySort("relevance");
    static magic = new QuerySort("magic");
    static name = new QuerySort("name");

    constructor(type) {
        this.type = type;
    }
}

class QueryReleaseStatus {

    static public = new QueryReleaseStatus("public");
    static private = new QueryReleaseStatus("private");
    static hidden = new QueryReleaseStatus("hidden");
    static all = new QueryReleaseStatus("all");

    constructor(type) {
        this.type = type;
    }
}

class Enums {

    static EventType = EventType;
    static QueryOrder = QueryOrder;
    static QuerySort = QuerySort;
    static QueryReleaseStatus = QueryReleaseStatus;

    constructor() {

    }
}

module.exports = { Enums, QueryReleaseStatus, QuerySort, QueryOrder, EventType };