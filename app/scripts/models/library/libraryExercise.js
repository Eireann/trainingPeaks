define(
[
    "underscore",
    "TP",
    "models/commands/addWorkoutFromExerciseLibrary",
    "models/workoutModel",
    "models/calendar/calendarDay"
],
function(
    _,
    TP,
    AddWorkoutFromExerciseLibrary,
    WorkoutModel,
    CalendarDay
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
            "exerciseLibraryItemFilters": null
        },

        initialize: function(attrs, options)
        {
            options = options || {};

            this.selectionManager = options.selectionManager || theMarsApp.selectionManager;
            this.calendarManager = options.calendarManager || theMarsApp.calendarManager;
        },

        urlRoot: function()
        {
            var library = this.get("exerciseLibraryId") ? this.get("exerciseLibraryId") : "default";
            return theMarsApp.apiRoot + "/exerciselibrary/v1/libraries/" + library + "/items";
        },

        dropped: function(options)
        {
            if(options.target instanceof CalendarDay)
            {
                theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                    theMarsApp.featureAuthorizer.features.SaveWorkoutToDate, 
                    _.bind(function(){
                        var workout = this.createWorkout({ date: options.target.id });
                        this.selectionManager.setSelection(workout);
                    }, this),
                    {targetDate: options.target.id}
                );
            }
        },

        createWorkout: function(options)
        {
            var workout = new WorkoutModel(
            {
                athleteId: theMarsApp.user.get("userId"),
                workoutDay: options.date,
                title: this.get("itemName"),
                workoutTypeValueId: this.get("workoutTypeId")
            });

            var attributesToCopy = ["caloriesPlanned", "description", "distancePlanned", "elevationGainPlanned", "energyPlanned", "ifPlanned", "totalTimePlanned", "tssPlanned", "velocityPlanned"];
            workout.set(this.pick(attributesToCopy));

            this.calendarManager.addItem(workout);

            // then update it with the full workout attributes from library
            var addFromLibraryCommand = new AddWorkoutFromExerciseLibrary({}, { workout: workout, exerciseLibraryItem: this });
            addFromLibraryCommand.execute();

            return workout;
        }

    });
});
