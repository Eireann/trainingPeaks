define(
[
    "TP",
    "hbs!templates/views/weekSummary"
],
function(TP, weekSummaryTemplate)
{
    return TP.ItemView.extend(
    {
        tagName: "div",
        className: "weekSummary",

        template:
        {
            type: "handlebars",
            template: weekSummaryTemplate
        },

        modelEvents:
        {
            "change": "render"
        }
    });
});