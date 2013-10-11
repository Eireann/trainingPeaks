define(
[
    "underscore",
    "TP",
    "models/workoutStatsForRange",
],
function(
    _,
    TP,
    WorkoutStatsForRange
)
{

    var ExpandoStateModel = TP.Model.extend(
    {

        initialize: function()
        {
            var ranges = new TP.Collection([], { model: WorkoutStatsForRange });

            this.set("ranges", ranges);
            this.on("change:statsRange", this._onStatsRangeChange, this);

            this.listenTo(ranges, "add", function(range) { range.set("isSelected", true); });
            this.listenTo(ranges, "remove", function(range) { range.set("isSelected", false); });
        },

        _onStatsRangeChange: function(self, range)
        {
            if(this.statsRange)
            {
                this.statsRange.set("isFocused", false);
            }
            this.statsRange = range;

            range.set("isFocused", true);

            console.log("focus", range);
            if(!range.hasLoaded)
            {
                range.fetch().done(function()
                {
                    range.hasLoaded = true;
                });
            }
        }

    });

    return ExpandoStateModel;

});
