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
            return theMarsApp.apiRoot + "/WebApiServer/Fitness/V1/workouts/filedata";
        },

        parse: function (response)
        {
            return { workoutModel: response };
        }
    });

    return WorkoutFileData;
});
