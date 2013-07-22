define(
[
    "underscore",
    "models/library/exerciseLibrariesCollection",
    "models/library/trainingPlanCollection",
    "models/workoutModel",
    "models/commands/addWorkoutFromExerciseLibrary",
    "views/calendar/library/libraryView"
],
function(
    _,
    ExerciseLibrariesCollection,
    TrainingPlanCollection,
    WorkoutModel,
    AddWorkoutFromExerciseLibrary,
    LibraryView)
{

    var calendarLibrary =
    {
        createNewWorkoutFromExerciseLibraryItem: function (exerciseLibraryId, exerciseLibraryItemId, workoutDate)
        {
            var exerciseLibraryItem = this.libraryCollections.exerciseLibraries.get(exerciseLibraryId).exercises.get(exerciseLibraryItemId);
            var workout = new WorkoutModel(
            {
                athleteId: theMarsApp.user.get("userId"),
                workoutDay: workoutDate,
                title: exerciseLibraryItem.get("itemName"),
                workoutTypeValueId: exerciseLibraryItem.get("workoutTypeId")
            });

            var attributesToCopy = ["caloriesPlanned", "description", "distancePlanned", "elevationGainPlanned", "energyPlanned", "ifPlanned", "totalTimePlanned", "tssPlanned", "velocityPlanned"];
            _.each(attributesToCopy, function(attr)
            {
                workout.set(attr, exerciseLibraryItem.get(attr));
            });

            // then update it with the full workout attributes from library
            var addFromLibraryCommand = new AddWorkoutFromExerciseLibrary({}, { workout: workout, exerciseLibraryItem: exerciseLibraryItem });
            addFromLibraryCommand.execute();

            return workout;
        },

        initializeLibrary: function ()
        {
            this.libraryCollections =
            {
                exerciseLibraries: new ExerciseLibrariesCollection(),
                trainingPlans: new TrainingPlanCollection()
            };

            if (this.views.library)
                this.views.library.close();

            this.views.library = new LibraryView({ collections: this.libraryCollections });
            this.views.library.on("library:select", this.onLibrarySelect, this);
        },

        getExerciseLibraries: function()
        {
            return this.libraryCollections.exerciseLibraries;
        },

        onLibrarySelect: function()
        {
            this.views.calendar.trigger("calendar:unselect");
        }

    };

    return calendarLibrary;
});