define(
[
    "TP"
],
function (TP)
{
    var WorkoutFileData = TP.Model.extend(
    {
        defaults: {
            fileName: null,
            description: null,
            data: null,
            workoutId: null
        },
       
        url: function ()
        {
            if (!this.has("workoutId"))
                throw "WorkoutFileAttachment requires a workout id";

            var athleteId = theMarsApp.user.get("athletes.0.athleteId");

            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.get("workoutId") + "/fileattachment";
        }
        
    });

    return WorkoutFileData;
});
