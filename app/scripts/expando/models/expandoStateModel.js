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

            this.set("ranges", new TP.Collection([], { model: WorkoutStatsForRange }));
            this.on("change:statsRange", this._fetchRange, this);
        },

        _fetchRange: function(self, range)
        {
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
