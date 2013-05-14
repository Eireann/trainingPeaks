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
        cacheable: true,

        url: function()
        {
            var libraryUrl = theMarsApp.apiRoot + "/exerciselibrary/v1/libraryitems";
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