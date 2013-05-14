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
        cacheable: true,

        url: function()
        {
            return theMarsApp.apiRoot + "/exerciselibrary/v1/libraries";
        }

    });
});