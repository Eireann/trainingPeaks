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
            var libraryUrl = theMarsApp.apiRoot + "/WebApiServer/ExerciseLibrary/V1/LibraryItems";
            if (this.exerciseLibraryId)
            {
                libraryUrl += "/" + this.exerciseLibraryId;
            }
            return libraryUrl;
        },

        initialize: function(models, options)
        {
            this.exerciseLibraryId = options && options.exerciseLibraryId ? options.exerciseLibraryId : null;
        }

    }, { exerciseLibraryId: null });
});