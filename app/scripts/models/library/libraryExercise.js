define(
[
    "underscore",
    "TP",
    "models/commands/addWorkoutFromExerciseLibrary",
    "models/workoutModel"
],
function(
    _,
    TP,
    AddWorkoutFromExerciseLibrary,
    WorkoutModel
)
{
    return TP.APIDeepModel.extend(
    {
        cacheable: true,
        webAPIModelName: "ExerciseLibraryItem",
        idAttribute: "exerciseLibraryItemId",

        itemTypeIds:
        {
            Exercise: 0,
            ExerciseRoutine: 1,
            WorkoutTemplate: 2
        },

        defaults:
        {
            "exerciseLibraryId": 0,
            "exerciseLibraryItemId": 0,
            "itemName": null,
            "itemType": 0,
            "workoutTypeId": 0,
            "distancePlanned": null,
            "totalTimePlanned": null,
            "caloriesPlanned": null,
            "tssPlanned": null,
            "ifPlanned": null,
            "velocityPlanned": null,
            "energyPlanned": null,
            "elevationGainPlanned": null,
            "description": null,
            "exerciseLibraryItemFilters": null,

            // only populated on details fetch
            "iExerciseLibraryItemValue": null,
            "referenceMediaValue": null,
            "attachmentFiles": null,
            "isStructuredWorkout": null,
            "libraryOwnerId": null
        },

        urlRoot: function()
        {
            var library = this.get("exerciseLibraryId") ? this.get("exerciseLibraryId") : "default";
            return this._getApiRoot() + "/exerciselibrary/v1/libraries/" + library + "/items";
        },

        createWorkout: function(options)
        {
            var workout = new WorkoutModel(
            {
                athleteId: this._getUser().get("userId"),
                workoutDay: options.date,
                title: this.get("itemName"),
                workoutTypeValueId: this.get("workoutTypeId")
            });

            var attributesToCopy = ["caloriesPlanned", "description", "distancePlanned", "elevationGainPlanned", "energyPlanned", "ifPlanned", "totalTimePlanned", "tssPlanned", "velocityPlanned"];
            workout.set(this.pick(attributesToCopy));

            // then update it with the full workout attributes from library
            var addFromLibraryCommand = new AddWorkoutFromExerciseLibrary({}, { workout: workout, exerciseLibraryItem: this });
            addFromLibraryCommand.execute();

            return workout;
        }

    });
});
