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

        initialize: function()
        {
            this.on("reset", this.setDefaultSelectedLibrary, this);
        },

        setDefaultSelectedLibrary: function()
        {
            var libraryWithOldestCreationDate = this.models[0];
            
            _.each(this.models, function(model)
            {
                if(model.get("dateCreated") < libraryWithOldestCreationDate.get("dateCreated"))
                    libraryWithOldestCreationDate = model;
            });

            if(libraryWithOldestCreationDate)
                libraryWithOldestCreationDate.set("selected", true, { silent: true });
        }
    });
});
