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
        idAttribute: "recurringPaymentProfileForPersonId",

        defaults:
        {
            recurringPaymentProfileForPersonId: null,
            profileId: null,
            personId: null,
            dateCreated: null,
            isActive: null,
            paidThrough: null,
            overridesPaypal: null,
            profileType: null,
            profileTypeData: null,
            accountNumber: null,
            expirationDate: null,
            payPeriod: null,
            amt: null
        }

    });
});