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
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.get("workoutId") + "/stats/" + this.get("begin") + "/" + this.get("end");
        },

        initialize: function()
        {

            if (!this.has("workoutId"))
                throw "workoutId is required for WorkoutStatsForRange";

            if (!this.has("begin"))
                throw "begin is required for WorkoutStatsForRange";

            if (!this.has("end"))
                throw "end is required for WorkoutStatsForRange";
        },
        
        parse: function(response)
        {
            if (this.has("name"))
                response.name = this.get("name");
            return response;
        }
    });

    return WorkoutStatsForRange;
});
