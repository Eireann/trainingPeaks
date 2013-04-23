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
            var athleteId = theMarsApp.user.get("athletes.0.athleteId");

            if (this.get("workoutId"))
                return theMarsApp.apiRoot + "/WebApiServer/fitness/v1/athletes/" + athleteId + "/workouts/" + this.get("workoutId") + "/filedata";
            else
                return theMarsApp.apiRoot + "/WebApiServer/fitness/v1/athletes/" + athleteId + "/workouts/filedata";
        },

        parse: function (response)
        {
            return { workoutModel: response };
        }
        
    });

    return WorkoutFileData;
});
