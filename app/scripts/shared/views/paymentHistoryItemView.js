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
        },

        initialize: function()
        {
            this.listenTo(theMarsApp.user, "change:dateFormat", _.bind(this.render, this));
        }


    });

    return PaymentHistoryItemView;
    
});
