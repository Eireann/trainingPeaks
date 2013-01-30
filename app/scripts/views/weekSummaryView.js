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

        initialize: function(options)
        {
            _.bindAll(this);
        },

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