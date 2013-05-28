define(
[
    "TP"
],
function(TP)
{
    var WorkoutStatsForRange = TP.Model.extend(
    {
        cacheable: true,

        url: function()
        {
            var athleteId = theMarsApp.user.get("athletes.0.athleteId");
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.get("workoutId") + "/stats/" + this.get("rangeStart") + "/" + this.get("rangeEnd");
        },

        initialize: function()
        {
            if (!this.has("workoutId"))
                throw "workoutId is required for WorkoutStatsForRange";

            if (!this.has("rangeStart"))
                throw "rangeStart is required for WorkoutStatsForRange";

            if (!this.has("rangeEnd"))
                throw "rangeEnd is required for WorkoutStatsForRange";
        }
    });

    return WorkoutStatsForRange;
});
