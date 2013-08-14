define(
[
    "TP"
],
function (TP)
{
    var WorkoutFileData = TP.Model.extend(
    {
        defaults:
        {
            fileName: null,
            description: null,
            data: null,
            workoutId: null
        },
       
        url: function ()
        {
            if (!this.has("workoutId"))
                throw new Error("WorkoutFileAttachment requires a workout id");

            var athleteId = theMarsApp.user.getCurrentAthleteId();

            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.get("workoutId") + "/attachments" + (this.id ? ("/" + this.id) : "");
        }
        
    });

    return WorkoutFileData;
});
