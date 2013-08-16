define(
[
    "TP"
],
function (TP)
{
    var WorkoutMultiFileData = TP.Model.extend(
    {
        url: function ()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();

            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/multifiledata";
        },

        parse: function (response)
        {
            return { workoutModels: response };
        }
        
    });

    return WorkoutMultiFileData;
});
