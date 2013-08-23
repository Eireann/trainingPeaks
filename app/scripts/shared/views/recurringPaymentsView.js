define(
[
    "TP",
    "shared/views/recurringPaymentsItemView",
    "hbs!shared/templates/recurringPaymentsTemplate"
],
function(
    TP,
    RecurringPaymentsItemView,
    recurringPaymentsTemplate
)
{
    var RecurringPaymentsView = TP.CompositeView.extend(
    {

        template:
        {
            type: "handlebars",
            template: recurringPaymentsTemplate
        },
        
        itemView: RecurringPaymentsItemView

    });

    return RecurringPaymentsView;

});

