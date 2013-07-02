define(
[
    "underscore",
    "TP",
    "views/home/scrollableColumnView",
    "hbs!templates/views/home/athlete/athleteHomeActivity"
],
function(
    _,
    TP,
    ScrollableColumnView,
    activityTemplate
    )
{
    return ScrollableColumnView.extend(
    {
        template:
        {
            type: "handlebars",
            template: activityTemplate
        },

        initialize: function(options)
        {
            // initialize the superclass
            this.constructor.__super__.initialize.call(this);
        }

    });
});