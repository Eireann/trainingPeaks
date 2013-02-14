define(
[
    "TP",
    "models/library/libraryExercise"
],
function(TP, LibraryExerciseModel)
{
    return TP.Collection.extend(
    {
        model: LibraryExerciseModel,

        url: function()
        {
            return theMarsApp.apiRoot + "/WebApiServer/ExerciseLibrary/V1/LibraryItems";
            //return "exercisesLibrary.json";
        },
        
        initialize: function()
        {
            this.fetch();
        }
    });
});