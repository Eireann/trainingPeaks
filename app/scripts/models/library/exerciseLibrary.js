define(
[
    "jquery",
    "TP",
    "models/library/libraryExercisesCollection"
],
function ($, TP, LibraryExercisesCollection)
{
    return TP.APIDeepModel.extend(
    {
        cacheable: true,
        webAPIModelName: "ExerciseLibrary",
        idAttribute: "exerciseLibraryId",

        defaults:
        {
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
            ownerName: null,
            priceRecursMonthly: false,
            selected: false
        },

        initialize: function(options)
        {
            this.exercises = new LibraryExercisesCollection();

            //#this.exercises.on("select", this.onSelect, this);

            // Users have the ability to purchase Libraries from other users/coaches. Those might be named the same as
            // other libraries that already exist in the User's list. Let's add the owner's name if it's not our library.
            if (this.get("ownerId") !== theMarsApp.user.get("userId"))
            {
                var ownerName = this.get("ownerId");
                if (this.get("ownerName") != null)
                {
                    ownerName = this.get("ownerName");
                }
                this.set("libraryName", this.get("libraryName") + " (" + ownerName + ")", { silent: true });
            }
        },

        fetchExercises: function(force)
        {
            if (this.exercises && this.exercises.length && !force)
            {
                var deferred = new $.Deferred();
                deferred.resolve();
                return deferred;
            }

            if (this.has("exerciseLibraryId"))
                this.exercises.exerciseLibraryId = this.get("exerciseLibraryId");

            return this.exercises.fetch({ reset: true });
        },

        length: function()
        {
            return this.exercises.length;
        },

        filter: function(filterFunction)
        {
            return this.exercises.filter(filterFunction);
        }
    });
});
