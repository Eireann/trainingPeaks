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
            this.set("ranges", new TP.Collection({ model: WorkoutStatsForRange }));

            this.listenTo(this.get("ranges"), "add", _.bind(this._fetchRange, this));
            this.listenTo(this.get("ranges"), "reset", function(ranges)
            {
                ranges.each(this._fetchRange, this);
            });
        },

        _fetchRange: function(range)
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
