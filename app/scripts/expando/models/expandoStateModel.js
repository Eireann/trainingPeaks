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
            this.on("change:primaryRange", this._onStatsRangeChange, this);

            this.listenTo(ranges, "add", _.bind(this._onRangeAdded, this));
            this.listenTo(ranges, "remove", _.bind(this._onRangeRemoved, this));
        },

        reset: function()
        {
            this.get("ranges").reset();
            this.set("primaryRange", null);
        },

        addRange: function(model)
        {
            this.get("ranges").add(model);
        },

        removeRange: function(model)
        {
            this.get("ranges").remove(model);
        },

        _onStatsRangeChange: function(self, range)
        {
            if(this.primaryRange)
            {
                this.primaryRange.getState().set("isFocused", false);
            }
            this.primaryRange = range;

            if(range)
            {
                range.getState().set("isFocused", true);

                if(!range.getState().get("hasLoaded"))
                {
                    range.fetch();
                }
            }
        },

        _onRangeAdded: function(range)
        {
            range.getState().set("isSelected", true);
        },

        _onRangeRemoved: function(range)
        {
            range.getState().set("isSelected", false);
        }

    });

    return ExpandoStateModel;

});
