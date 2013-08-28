define(
[
    "TP",
    "hbs!shared/templates/paymentHistoryItemTemplate"
],
function(
    TP,
    paymentHistoryItemTemplate
)
{
    var PaymentHistoryItemView = TP.ItemView.extend(
    {

        className: "paymentHistoryItem",

        template:
        {
            type: "handlebars",
            template: paymentHistoryItemTemplate
        }

    });

    return PaymentHistoryItemView;
    
});
