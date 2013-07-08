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

        initialize: function(options)
        {
            // initialize the superclass
            this.constructor.__super__.initialize.call(this, { template: summaryTemplate });
        }

    });
});