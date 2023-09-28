const Util = require('./Util.js');

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
     * Creates a Group and returns a Group object. **Requires VRC+ Subscription.**
     * 
     * @returns {Promise<JSON>} 
     */
    async CreateGroup({ name = "", shortCode = "", description = "", joinState = "", iconId = "", bannerId = "", privacy = "", roleTemplate = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!name || !shortCode || !roleTemplate) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups`, { method: 'POST', body: this.#GenerateBody({ name, shortCode, description, joinState, iconId, bannerId, privacy, roleTemplate }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a single Group by ID.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupById({ groupId = "", includeRoles = false } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}${this.#GenerateParameters(includeRoles)}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Updates a Group and returns it.
     * 
     * @returns {Promise<JSON>} 
     */
    async UpdateGroup({ groupId = "", name = "", shortCode = "", description = "", joinState = "", iconId = "", bannerId = "", privacy = "", roleTemplate = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}`, { method: 'PUT', body: this.#GenerateBody({ name, shortCode, description, joinState, iconId, bannerId, privacy, roleTemplate }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteGroup(groupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns the announcement for a Group. If no announcement has been made, then it returns **empty object**. If an announcement exists, then it will always return all fields except imageId and imageUrl which may be null.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupAnnouncement(groupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/announcement`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Creates an Announcement for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async CreateGroupAnnouncement({ groupId = "", title = "", text = "", imageId = "", sendNotification = false } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !title) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/announcement`, { method: 'POST', body: this.#GenerateBody({ title, text, imageId, sendNotification }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Deletes the announcement for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async DeleteGroupAnnouncement(groupId = "") {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/announcement`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a list of audit logs for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupAuditLogs({ groupId = "", n = 60, offset = 0, startDate = "", endDate = "" } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/auditLogs${this.#GenerateParameters({ n, offset, startDate, endDate })}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a list of banned users for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupBans({ groupId = "", n = 60, offset = 0 } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/bans${this.#GenerateParameters({ n, offset })}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Bans a user from a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async BanGroupMember(groupId = "", userId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/bans`, { method: 'POST', body: this.#GenerateBody({ userId }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Unbans a user from a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async UnbanGroupMember(groupId = "", userId = "") { 
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !userId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/bans/${userId}`, { method: 'DELETE', headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Creates a gallery for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async CreateGroupGallery({ groupId = "", name = "", description = "", membersOnly = false, roleIdsToView = [], roleIdsToSubmit = [], roleIdsToAutoApprove = [], roleIdsToManage = [] } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !name) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries`, { method: 'POST', body: this.#GenerateBody({ name, description, membersOnly, roleIdsToView, roleIdsToSubmit, roleIdsToAutoApprove, roleIdsToManage }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Returns a list of images for a Group gallery.
     * 
     * @returns {Promise<JSON>} 
     */
    async GetGroupGalleryImages({ groupId = "", galleryId = "", n = 60, offset = 0, approved = false }) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !galleryId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}${this.#GenerateParameters({ n, offset, approved })}`, { headers: this.#GenerateHeaders(true) });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
    }

    /**
     * 
     * Updates a gallery for a Group.
     * 
     * @returns {Promise<JSON>} 
     */
    async UpdateGroupGallery({ groupId = "", groupGalleryId = "", name = "", description = "", membersOnly = false, roleIdsToView = [], roleIdsToSubmit = [], roleIdsToAutoApprove = [], roleIdsToManage = [] } = {}) {
        if(!this.#authCookie) return { success: false, status: 401 };
        if(!groupId || !groupGalleryId) return { success: false, status: 400 };

        const res = await this.#fetch(`${this.#APIEndpoint}/groups/${groupId}/galleries/${groupGalleryId}`, { method: 'PUT', body: this.#GenerateBody({ name, description, membersOnly, roleIdsToView, roleIdsToSubmit, roleIdsToAutoApprove, roleIdsToManage }), headers: this.#GenerateHeaders(true, "application/json") });
        if(!res.ok) return { success: false, status: res.status };

        return { success: true, res: await res.json() };
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