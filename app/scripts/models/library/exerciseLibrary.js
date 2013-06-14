define(
[
    "TP",
    "models/library/libraryExercisesCollection"
],
function (TP, LibraryExercisesCollection)
{
    return TP.APIModel.extend(
    {
        cacheable: true,
        webAPIModelName: "ExerciseLibrary",
        idAttribute: "exerciseLibraryId",

        defaults: {
            athletePrice: 0,
            coachPrice: 0,
            dateCreated: 0,
            dateModified: 0,
            daysToCompSubscription: 0,
            description: "",
            descriptionFileData: null,
            descriptionFileDataId: 0,
            exerciseLibraryId: 0,
            isDeleted: false,
            isPublic: false,
            libraryName: "",
            listInDirectory: false,
            ownerId: 0,
            priceRecursMonthly: false
        },

        initialize: function(options)
        {
            this.exercises = new LibraryExercisesCollection();
            this.exercises.on("select", this.onSelect, this);
        },

        fetchExercises: function(force)
        {
            if (this.exercises && this.exercises.length && !force)
                return;

            if (this.has("exerciseLibraryId"))
            {
                this.exercises.exerciseLibraryId = this.get("exerciseLibraryId");
            }
            this.exercises.fetch({ reset: true });
        },

        onSelect: function(model)
        {
            this.trigger("select", model);
        }

    });
});