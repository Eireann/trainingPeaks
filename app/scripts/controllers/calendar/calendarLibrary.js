define(
[
    "models/library/exerciseLibrariesCollection",
    "models/workoutModel",
    "models/commands/addWorkoutFromExerciseLibrary",
"views/library/libraryView"
],
function(
    ExerciseLibrariesCollection,
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

            // then update it with the full workout attributes from library
            var addFromLibraryCommand = new AddWorkoutFromExerciseLibrary({}, { workout: workout, exerciseLibraryItem: exerciseLibraryItem });
            addFromLibraryCommand.execute();

            return workout;
        },

        initializeLibrary: function ()
        {
            this.libraryCollections =
            {
                exerciseLibraries: new ExerciseLibrariesCollection()
            };

            if (this.views.library)
                this.views.library.close();

            this.views.library = new LibraryView({ collections: this.libraryCollections });
            this.views.library.on("animate", this.onLibraryAnimate, this);
            this.views.library.on("dragItem", this.onLibraryDragItem, this);
        },

        onLibraryAnimate: function (cssAttributes, duration)
        {
            this.views.calendar.onLibraryAnimate(cssAttributes, duration);
        },

        getExerciseLibraries: function ()
        {
            return this.libraryCollections.exerciseLibraries;
        },

        onLibraryDragItem: function(itemView, dragPosition)
        {
            this.views.calendar.onDragItem(itemView, dragPosition);
        }

    };

    return calendarLibrary;
});