define(
[
    "TP",
    "hbs!templates/views/dayBarView"
],
function (TP, dayBarViewTemplate)
{
    return TP.ItemView.extend(
    {
        className: "day",

        template:
        {
            type: "handlebars",
            template: dayBarViewTemplate
        }
    });
});