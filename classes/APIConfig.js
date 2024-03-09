class APIConfig {

    VoiceEnableDegradation = false;
    VoiceEnableReceiverLimiting = true;
    address = "";
    announcements = [];
    appName = "";
    buildVersionTag = "";
    clientApiKey = "";
    clientBPSCeiling = 18432;
    clientDisconnectTimeout = 30000;
    clientReservedPlayerBPS = 7168;
    clientSentCountAllowance = 15;
    contactEmail = "";
    copyrightEmail = "";
    currentTOSVersion = 7;
    defaultAvatar = "";
    deploymentGroup = "";
    devAppVersionStandalone = "";
    devDownloadLinkWindows = "";
    devSdkUrl = "";
    devSdkVersion = "";
    devServerVersionStandalone = "";
    discountdown = "";
    disableAvatarCopying = false;
    disableAvatarGating = false;
    disableCommunityLabs = false;
    disableCommunityLabsPromotion = false;
    disableEmail = false;
    disableEventStream = false;
    disableFeedbackGating = false;
    disableFrontendBuilds = false;
    disableHello = false;
    disableOculusSubs = false;
    disableRegistration = false;
    disableSteamNetworking = true;
    disableTwoFactorAuth = false;
    disableUdon = false;
    disableUpgradeAccount = false;
    downloadLinkWindows = "";
    downloadUrls = {};
    dynamicWorldRows = [];
    events = {};
    gearDemoRoomId = "";
    homeWorldId = "";
    homepageRedirectTarget = "";
    hubWorldId = "";
    jobsEmail = "";
    messageOfTheDay = "";
    moderationEmail = "";
    moderationQueryPeriod = 60;
    notAllowedToSelectAvatarInPrivateWorldMessage = "";
    plugin = "";
    releaseAppVersionStandalone = "";
    releaseSdkUrl = "";
    releaseSdkVersion = "";
    releaseServerVersionStandalone = "";
    sdkDeveloperFaqUrl = "";
    sdkDiscordUrl = "";
    sdkNotAllowedToPublishMessage = "";
    sdkUnityVersion = "";
    serverName = "";
    supportEmail = "";
    timeOutWorldId = "";
    tutorialWorldId = "";
    updateRateMsMaximum = 1000;
    updateRateMsMinimum = 50;
    updateRateMsNormal = 200;
    updateRateMsUdonManual = 50;
    uploadAnalysisPercent = 1;
    urlList = [];
    useReliableUdpForVoice = false;
    userUpdatePeriod = 60;
    userVerificationDelay = 5;
    userVerificationRetry = 30;
    userVerificationTimeout = 60;
    viveWindowsUrl = "";
    whiteListedAssetUrls = [];
    worldUpdatePeriod = 60;
    playerurlresolverhash = "";
    playerurlresolverversion = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    }

}

module.exports = { APIConfig };