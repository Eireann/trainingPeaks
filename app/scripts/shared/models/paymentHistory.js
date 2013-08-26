define(
[
    "TP"
],
function(TP)
{
    return TP.APIDeepModel.extend(
    {
        cacheable: false,

        webAPIModelName: "RecurringPaymentProfile",
        idAttribute: "paypalImportId",

        defaults:
        {
            paypalImportId: null,
            personId: null,
            paypalDate: null,
            affiliateCode: null,
            transId: null,
            originalTransId: null,
            sku: null,
            comment1: null,
            comment2: null,
            type: null,
            accountNumber: null,
            expiration: null,
            total: null,
            totalAsDollars: null,
            paypalTransactionId: null,
            skuDescription: null
        }

    });
});