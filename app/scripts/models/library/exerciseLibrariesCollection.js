define(
[
    "TP",
    "models/library/exerciseLibrary"
],
function(TP, ExerciseLibraryModel)
{
    return TP.Collection.extend(
    {
        model: ExerciseLibraryModel,

        url: function()
        {
            return theMarsApp.apiRoot + "/WebApiServer/ExerciseLibrary/V1/Libraries";
        }

    });
});