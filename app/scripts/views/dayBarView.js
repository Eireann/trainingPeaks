define(
[
    "TP",
    "hbs!templates/views/dayBarView"
],
function (TP, dayBarViewTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: dayBarViewTemplate
        }
    });
});