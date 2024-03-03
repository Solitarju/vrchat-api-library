const { Group } = require('../Group.js');
const { LimitedGroup } = require('../LimitedGroup.js');
const { GroupMember } = require('../GroupMember.js');
const { GroupAnnouncement } = require('../GroupAnnouncement.js');
const { GroupGallery } = require('../GroupGallery.js');
const { GroupGalleryImage } = require('../GroupGalleryImage.js');
const { GroupAudit } = require('../GroupAudit.js');
const { Success } = require('../Success.js');
const { Error } = require('../Error.js');
const Util = require('../Util.js');

class GroupsApi {
    
    #fetch;
    #UserAgent;

    #APIEndpoint = "https://api.vrchat.cloud/api/1";

    #userid = "";
    #authCookie = "";
    #twoFactorAuth = "";
    #debug;

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

    #GenerateBody(params = {}) {
        var json = {};
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value) return;
            if(!value.length) return;
            
            json[key] = value;
        });
        return JSON.stringify(json);
    }

    /**
     * 
     * Searches Groups by name or shortCode.
     * 
     * @param {Object} [json={}] 
     * @param {string} [json.query=""] 
     * @param {number} [json.offset=0] 
     * @param {number} [json.n=60] 
     * 
     * @returns {Promise<Array<LimitedGroup>>} Returns an array of LimitedGroup objects.
     * 
     */
    async SearchGroup({query, offset, n} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups${this.#GenerateParameters({query, offset, n})}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        
        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new LimitedGroup(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Creates a Group and returns a Group object. **Requires VRC+ Subscription.**
     * 
     * @param {Object} [json={}] 
     * @param {string} [json.name=""] 
     * @param {string} [json.shortCode=""] 
     * @param {string} [json.description=""] 
     * @param {string} [json.joinState=""] 
     * @param {string} [json.iconId=""] 
     * @param {string} [json.bannerId=""] 
     * @param {string} [json.privacy=""] 
     * @param {string} [json.roleTemplate=""] 
     * 
     * @returns {Promise<Group>} Returns a single Group object.
     */
    async CreateGroup({name, shortCode, description, joinState, iconId, bannerId, privacy, roleTemplate} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!name || !shortCode || !roleTemplate) return new Error("Required Argument(s): name, shortCode, roleTemplate", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups`, { method: 'POST', body: this.#GenerateBody({ name, shortCode, description, joinState, iconId, bannerId, privacy, roleTemplate }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Group(json);
    }

    /**
     * 
     * Returns a single Group by ID.
     * 
     * @param {Object} [json={}] 
     * @param {string} [json.groupId=""] 
     * @param {boolean} [json.includeRoles=false] 
     * 
     * @returns {Promise<Group>} Returns a single Group object.
     */
    async GetGroupById({groupId, includeRoles} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId) return new Error("Required Argument(s): groupId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}${this.#GenerateParameters({includeRoles})}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Group(json);
    }

    /**
     * 
     * Updates a Group and returns it.
     * 
     * @param {Object} [json={}] 
     * @param {string} [json.groupId=""] 
     * @param {string} [json.name=""] 
     * @param {string} [json.shortCode=""] 
     * @param {string} [json.description=""] 
     * @param {string} [json.joinState=""] 
     * @param {string} [json.iconId=""] 
     * @param {string} [json.bannerId=""] 
     * @param {string} [json.privacy=""] 
     * @param {string} [json.roleTemplate=""] 
     * 
     * @returns {Promise<Group>} Returns a single Group object.
     */
    async UpdateGroup({groupId, name, shortCode, description, joinState, iconId, bannerId, privacy, roleTemplate} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}`, { method: 'PUT', body: this.#GenerateBody({ name, shortCode, description, joinState, iconId, bannerId, privacy, roleTemplate }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Group(json);
    }

    /**
     * 
     * Deletes a Group.
     * 
     * @param {string} groupId 
     * 
     * @returns {Promise<Success>} Returns a single Success object.
     */
    async DeleteGroup(groupId) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId) return new Error("Required Argument(s): groupId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

    /**
     * 
     * Returns the announcement for a Group. If no announcement has been made, then it returns **empty object**. If an announcement exists, then it will always return all fields except `imageId` and `imageUrl` which may be null.
     * 
     * @param {string} groupId 
     * 
     * @returns {Promise<GroupAnnouncement>} Returns a single GroupAnnouncement object. 
     */
    async GetGroupAnnouncement(groupId) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId) return new Error("Required Argument(s): groupId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/announcement`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new GroupAnnouncement(json);
    }

    /**
     * 
     * Creates an Announcement for a Group.
     * 
     * @param {Object} [json={}] 
     * @param {string} [json.groupId=""] 
     * @param {string} [json.title=""] 
     * @param {string} [json.text=""] 
     * @param {string} [json.imageId=""] 
     * @param {boolean} [json.sendNotification=false] 
     * 
     * @returns {Promise<GroupAnnouncement>} Returns a single GroupAnnouncement object. 
     */
    async CreateGroupAnnouncement({groupId, title, text, imageId, sendNotification} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId || !title) return new Error("Required Argument(s): groupId, title", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/announcement`, { method: 'POST', body: this.#GenerateBody({ title, text, imageId, sendNotification }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new GroupAnnouncement(json);
    }

    /**
     * 
     * Deletes the announcement for a Group.
     * 
     * @param {string} groupId
     * 
     * @returns {Promise<Success>} Returns a single Success object. 
     */
    async DeleteGroupAnnouncement(groupId) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId) return new Error("Required Argument(s): groupId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/announcement`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new Success(json);
    }

    /**
     * 
     * Returns a list of audit logs for a Group.
     * 
     * @param {Object} [json={}] 
     * @param {string} json.groupId
     * @param {number} [json.n=60] 
     * @param {number} [json.offset=0] 
     * @param {string} [json.startDate=""] 
     * @param {string} [json.endDate=""] 
     * 
     * @returns {Promise<GroupAudit>} Returns a single GroupAudit object.
     */
    async GetGroupAuditLogs({groupId, n, offset, startDate, endDate} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId) return new Error("Required Argument(s): groupId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/auditLogs${this.#GenerateParameters({ n, offset, startDate, endDate })}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new GroupAudit(json);
    }

    /**
     * 
     * Returns a list of banned users for a Group.
     * 
     * @param {Object} [json={}] 
     * @param {string} json.groupId
     * @param {number} [json.n=60] 
     * @param {number} [json.offset=0] 
     * 
     * @returns {Promise<Array<GroupMember>>} Returns an array of GroupMember objects. 
     */
    async GetGroupBans({groupId, n, offset} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId) return new Error("Required Argument(s): groupId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/bans${this.#GenerateParameters({ n, offset })}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new GroupMember(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Bans a user from a Group.
     * 
     * @param {string} groupId 
     * @param {string} userId
     * 
     * @returns {Promise<GroupMember>} Returns a single GroupMember object.
     */
    async BanGroupMember(groupId, userId) { 
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId || !userId) return new Error("Required Argument(s): groupId, userId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/bans`, { method: 'POST', body: this.#GenerateBody({ userId }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new GroupMember(json);
    }

    /**
     * 
     * Unbans a user from a Group.
     * 
     * @param {string} groupId 
     * @param {string} userId
     * 
     * @returns {Promise<GroupMember>} Returns a single GroupMember object. 
     */
    async UnbanGroupMember(groupId, userId) { 
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId || !userId) return new Error("Required Argument(s): groupId, userId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/bans/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new GroupMember(json);
    }

    /**
     * 
     * Creates a gallery for a Group.
     * 
     * @param {Object} [json={}] 
     * @param {string} json.groupId
     * @param {string} json.name
     * @param {string} [json.description=""] 
     * @param {boolean} [json.membersOnly=false] 
     * @param {string[]} [json.roleIdsToView=[]] 
     * @param {string[]} [json.roleIdsToSubmit=[]] 
     * @param {string[]} [json.roleIdsToAutoApprove=[]] 
     * @param {string[]} [json.roleIdsToManage=[]] 
     * 
     * @returns {Promise<GroupGallery>} Returns a single GroupGallery object. 
     */
    async CreateGroupGallery({groupId, name, description, membersOnly, roleIdsToView, roleIdsToSubmit, roleIdsToAutoApprove, roleIdsToManage} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId || !name) return new Error("Required Argument(s): groupId, name", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries`, { method: 'POST', body: this.#GenerateBody({ name, description, membersOnly, roleIdsToView, roleIdsToSubmit, roleIdsToAutoApprove, roleIdsToManage }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new GroupGallery(json);
    }

    /**
     * 
     * Returns a list of images for a Group gallery.
     * 
     * @param {Object} [json={}] 
     * @param {string} json.groupId
     * @param {string} json.galleryId
     * @param {number} [json.n=60] 
     * @param {number} [json.offset=0] 
     * @param {boolean} [json.approved=false] 
     * 
     * @returns {Promise<Array<GroupGalleryImage>>} Returns an Array of GroupGalleryImage objects. 
     */
    async GetGroupGalleryImages({groupId, galleryId, n, offset, approved} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId || !galleryId) return new Error("Required Argument(s): groupId, galleryId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}${this.#GenerateParameters({ n, offset, approved })}`, { headers: this.#GenerateHeaders(true) });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);

        var returnArray = [];
        for(let i = 0; i < json.length; i++) {
            returnArray.push(new GroupGalleryImage(json[i]));
        }
        return returnArray;
    }

    /**
     * 
     * Updates a gallery for a Group.
     * 
     * @param {Object} [json={}] 
     * @param {string} json.groupId
     * @param {string} json.groupGalleryId
     * @param {string} [json.name=""] 
     * @param {string} [json.description=""] 
     * @param {boolean} [json.membersOnly=false] 
     * @param {any[]} [json.roleIdsToView=[]] 
     * @param {any[]} [json.roleIdsToSubmit=[]] 
     * @param {any[]} [json.roleIdsToAutoApprove=[]] 
     * @param {any[]} [json.roleIdsToManage=[]] 
     * 
     * @returns {Promise<GroupGallery>} Returns a single GroupGallery object.
     */
    async UpdateGroupGallery({groupId, groupGalleryId, name, description, membersOnly, roleIdsToView, roleIdsToSubmit, roleIdsToAutoApprove, roleIdsToManage} = {}) {
        if(!this.#authCookie) return new Error("Invalid Credentials", 401, {});
        if(!groupId || !groupGalleryId) return new Error("Required Argument(s): groupId, groupGalleryId", 400, {});

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}`, { method: 'PUT', body: this.#GenerateBody({ name, description, membersOnly, roleIdsToView, roleIdsToSubmit, roleIdsToAutoApprove, roleIdsToManage }), headers: this.#GenerateHeaders(true, "application/json") });
        const json = await res.json();

        if(!res.ok) return new Error(json.error?.message ?? "", res.status, json);
        return new GroupGallery(json);
    }

    /**
     * 
     * Deletes a gallery for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteGroupGallery(groupId = "", groupGalleryId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupGalleryId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Adds an image to a Group gallery.
     * 
     * @returns {Promise<JSON>} 
     */
    async AddGroupGalleryImage(groupId = "", groupGalleryId = "", fileId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupGalleryId || !fileId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}/images`, { method: 'PUT', body: this.#GenerateBody({ fileId }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes an image from a Group gallery.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteGroupGalleryImage(groupId = "", groupGalleryId = "", groupGalleryImageId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupGalleryId || !groupGalleryImageId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}/images/${groupGalleryImageId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a list of members that have been invited to the Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupInvitesSent(groupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/invites`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Sends an invite to a user to join the group.
     * 
     * @returns {Promise<JSON>} 
     */
    async InviteUserToGroup({ groupId = "", userId = "", confirmOverrideBlock = true } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/invites`, { method: 'POST', body: this.#GenerateBody({ userId, confirmOverrideBlock }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes an Group invite sent to a User.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteUserInvite(groupId = "", userId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/invites/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Join a Group by ID and returns the member object.
     * 
     * @returns {Promise<JSON>} 
     */
    async JoinGroup(groupId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/join`, { method: 'POST', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Leave a group by ID.
     * 
     * @returns {Promise<JSON>} 
     */
    async LeaveGroup(groupId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/leave`, { method: 'POST', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a List of all **other** Group Members. This endpoint will never return the user calling the endpoint. Information about the user calling the endpoint must be found in the myMember field of the Group object.
     * 
     * @returns {Promise<JSON>} 
     */
    async ListGroupMembers({ groupId = "", n = 60, offset = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/members${this.#GenerateParameters({ n, offset })}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a LimitedGroup Member.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupMember(groupId = "", userId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/members/${userId}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Updates a Group Member.
     * 
     * @returns {Promise<JSON>} 
     */
    async UpdateGroupMember({ groupId = "", userId = "", visibility = "", isSubscribedToAnnouncements = false, managerNotes = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/members/${userId}`, { method: 'PUT', body: this.#GenerateBody({ visibility, isSubscribedToAnnouncements, managerNotes }),headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Kicks a Group Member from the Group. The current user must have the "Remove Group Members" permission.
     * 
     * @returns {Promise<JSON>} 
     */
    async KickGroupMember(groupId = "", userId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/members/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Adds a Role to a Group Member.
     * 
     * @returns {Promise<JSON>} 
     */
    async AddRoleToGroupMember(groupId = "", userId = "", groupRoleId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId || !groupRoleId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/members/${userId}/roles/${groupRoleId}`, { method: 'PUT', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Removes a Role from a Group Member.
     * 
     * @returns {Promise<JSON>} 
     */
    async RemoveRoleFromGroupMember(groupId = "", userId = "", groupRoleId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId || !groupRoleId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/members/${userId}/roles/${groupRoleId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a List of all possible/available permissions for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async ListGroupPermissions(groupId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/permissions`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a list of members that have requested to join the Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupJoinRequests(groupId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/requests`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Cancels a request sent to join the group.
     * 
     * @returns {Promise<JSON>} 
     */
    async CancelGroupJoinRequest(groupId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/requests`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Responds to a Group Join Request with Accept/Deny
     * 
     * @returns {Promise<JSON>} 
     */
    async RespondToGroupJoinRequest({ groupId = "", userId = "", action = "" }) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/requests/${userId}`, { method: 'PUT', body: this.#GenerateBody({ action }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a Group Role by ID.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupRoles(groupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/roles`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Create a Group role.
     * 
     * @returns {Promise<JSON>} 
     */
    async CreateGroupRole({ groupId = "", id = "", name = "", description = "", isSelfAssignable = false, permissions = [] } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/roles`, { method: 'POST', body: this.#GenerateBody({ id, name, description, isSelfAssignable, permissions }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Updates a group role by ID.
     * 
     * @returns {Promise<JSON>} 
     */
    async UpdateGroupRole({ groupId = "", groupRoleId = "", name = "", description = "", isSelfAssignable = false, permissions = [], order = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupRoleId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/roles/${groupRoleId}`, { method: 'PUT', body: this.#GenerateBody({ name, description, isSelfAssignable, permissions, order }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes a Group Role by ID and returns the remaining roles.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteGroupRole(groupId = "", groupRoleId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupRoleId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/roles/${groupRoleId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

}

module.exports = { GroupsApi };