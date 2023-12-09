class Transaction {

    id = "";
    status = "";
    subscription = {"id":"","steamItemId":"","amount":0,"description":"","period":"","tier":0};
    sandbox = false;
    created_at = "";
    updated_at = "";
    steam = {"walletInfo":{"state":"","country":"","currency":"","status":""},"steamId":"","orderId":"","steamUrl":"","transId":""};
    agreement = {"agreementId":"","itemId":0,"status":"","period":"","frequency":0,"billingType":"","startDate":"","endDate":"","recurringAmt":0,"currency":"","timeCreated":"","nextPayment":"","lastPayment":"","lastAmount":0,"lastAmountVat":0,"outstanding":0,"failedAttempts":0};
    error = "";

    constructor(res = {}) {
        if(!Object.keys(res).length > 0) return this;
        Object.keys(res).forEach(element => {
            this[element] = res[element];
        });
    };

}

module.exports = { Transaction };