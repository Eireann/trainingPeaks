define(
[
    "underscore",
    "TP",
    "views/home/scrollableColumnView",
    "hbs!templates/views/home/athlete/athleteHomeSummary"
],
function(
    _,
    TP,
    ScrollableColumnView,
    summaryTemplate
    )
{
    return ScrollableColumnView.extend(
    {
        template:
        {
            type: "handlebars",
            template: summaryTemplate
        }
    });
});