define(
[
    "moment",
    "TP",
    "./paymentHistory"
],
function(moment, TP, PaymentHistoryModel)
{
    return TP.Collection.extend(
    {
        model: PaymentHistoryModel,

        cacheable: false,

        url: function()
        {
            return theMarsApp.apiRoot + "/users/v1/user/paymenthistory";
        }

    });
});