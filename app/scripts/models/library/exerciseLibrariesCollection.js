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
        },

        comparator: function(model)
        {
            var libraryName = model.get("libraryName");
            return _.isString(libraryName) ? libraryName.trim().toLowerCase() : libraryName;
        },

        getDefaultLibraryId: function()
        {
            console.log(this.models);
            var selectedLibrary = _.find(this.models, function(model)
            {
                if(model.get("libraryName") === "My Library")
                    return true;
            });

            return selectedLibrary.id;
        }
    });
});
