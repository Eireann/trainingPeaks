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

            return theMarsApp.apiRoot + "/WebApiServer/Fitness/V1/workouts/" + this.get("workoutId") + "/fileattachment";
        }
        
    });

    return WorkoutFileData;
});
