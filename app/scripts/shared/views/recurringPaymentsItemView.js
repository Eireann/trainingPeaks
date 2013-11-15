define(
[
    "underscore",
    "TP",
    "hbs!shared/templates/recurringPaymentsItemTemplate"
],
function(
    _,
    TP,
    recurringPaymentsItemTemplate
)
{
    var RecurringPaymentsItemView = TP.ItemView.extend(
    {
        className: "recurringPaymentItem",

        template:
        {
            type: "handlebars",
            template: recurringPaymentsItemTemplate
        },

        initialize: function()
        {
            this.listenTo(theMarsApp.user, "change:dateFormat", _.bind(this.render, this));
        }
        
    });

    return RecurringPaymentsItemView;
    
});
