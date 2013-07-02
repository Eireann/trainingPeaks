define(
[
    "underscore",
    "TP",
    "views/home/scrollableColumnView",
    "hbs!templates/views/home/athlete/athleteHomePods"
],
function(
    _,
    TP,
    ScrollableColumnView,
    podsTemplate
    )
{
    return ScrollableColumnView.extend(
    {
        template:
        {
            type: "handlebars",
            template: podsTemplate
        }
    });
});