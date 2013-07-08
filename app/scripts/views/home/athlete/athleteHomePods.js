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

        initialize: function(options)
        {
            // initialize the superclass
            this.constructor.__super__.initialize.call(this, { template: podsTemplate });
        }

    });
});