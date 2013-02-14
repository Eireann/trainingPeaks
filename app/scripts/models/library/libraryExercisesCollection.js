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
            //return theMarsApp.apiRoot + "/WebApiServer/ExercisesLibrary";
            return "exercisesLibrary.json";
        },
        
        initialize: function()
        {
            this.fetch();
        }
    });
});