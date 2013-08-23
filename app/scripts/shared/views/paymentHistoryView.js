define(
[
    "TP",
    "shared/views/paymentHistoryItemView",
    "hbs!shared/templates/paymentHistoryTemplate"
],
function(
    TP,
    PaymentHistoryItemView,
    paymentHistoryTemplate
)
{
    var PaymentHistoryView = TP.CompositeView.extend(
    {

        template:
        {
            type: "handlebars",
            template: paymentHistoryTemplate
        },
        
        itemView: PaymentHistoryItemView

    });

    return PaymentHistoryView;

});
