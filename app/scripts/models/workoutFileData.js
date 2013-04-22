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
            if (this.get("workoutId"))
                return theMarsApp.apiRoot + "/WebApiServer/Fitness/V1/workouts/" + this.get("workoutId") + "/filedata";
            else
                return theMarsApp.apiRoot + "/WebApiServer/Fitness/V1/workouts/filedata";
        },

        parse: function (response)
        {
            return { workoutModel: response };
        }
        
    });

    return WorkoutFileData;
});
