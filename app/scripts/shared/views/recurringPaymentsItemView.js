define(
[
    "TP",
    "hbs!shared/templates/recurringPaymentsItemTemplate"
],
function(
    TP,
    recurringPaymentsItemTemplate
)
{
    var RecurringPaymentsItemView = TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: recurringPaymentsItemTemplate
        }

    });

    return RecurringPaymentsItemView;
    
});
