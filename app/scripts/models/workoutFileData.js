define(
[
    "TP"
],
function (TP)
{
    var WorkoutFileData = TP.Model.extend(
    {
        url: function ()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();

            if (this.get("workoutId") && this.id)
                return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.get("workoutId") + "/filedata/" + this.id;
            else if (this.get("workoutId"))
                return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.get("workoutId") + "/filedata";
            else
                return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/filedata";
        },

        parse: function (response)
        {
            return { workoutModel: response };
        }
        
    });

    return WorkoutFileData;
});
