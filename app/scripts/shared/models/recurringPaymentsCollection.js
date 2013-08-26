define(
[
    "moment",
    "TP",
    "./recurringPayment"
],
function(moment, TP, RecurringPaymentModel)
{
    return TP.Collection.extend(
    {
        model: RecurringPaymentModel,

        cacheable: false,

        url: function()
        {
            return theMarsApp.apiRoot + "/users/v1/user/recurringpaymentprofiles";
        }

    });
});