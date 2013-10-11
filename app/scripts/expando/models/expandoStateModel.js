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

            this.listenTo(ranges, "add", _.bind(this._onRangeAdded, this));
            this.listenTo(ranges, "remove", _.bind(this._onRangeRemoved, this));
        },

        _onStatsRangeChange: function(self, range)
        {
            if(this.statsRange)
            {
                this.statsRange.set("isFocused", false);
            }
            this.statsRange = range;

            if(range)
            {
                range.set("isFocused", true);

                if(!range.hasLoaded)
                {
                    range.fetch().done(function()
                    {
                        range.hasLoaded = true;
                    });
                }
            }
        },

        _onRangeAdded: function(range)
        {
            range.set("isSelected", true);
        },

        _onRangeRemoved: function(range)
        {
            range.set("isSelected", false);
            if(range.get("temporary") && this.get("statsRange") === range)
            {
                this.set("statsRange", null);
            }

        }

    });

    return ExpandoStateModel;

});
