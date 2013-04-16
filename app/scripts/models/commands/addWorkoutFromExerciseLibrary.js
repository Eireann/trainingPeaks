define(
[
    "TP"
],
function(TP)
{

    return TP.Model.extend(
    {

        urlRoot: function()
        {
            return theMarsApp.apiRoot + "/WebApiServer/Fitness/V1/commands/addworkoutfromlibraryitem";
        },

        defaults: function()
        {
            return {
                athleteId: theMarsApp.user.has("userId") ? theMarsApp.user.get("userId") : 0,
                exerciseLibraryItemId: 0,
                workoutDateTime: null,
                workoutData: {}
            };
        },

        initialize: function(attributes, options)
        {
            if (!options.workout)
                throw "AddWorkoutFromExerciseLibrary requires a workout model";

            if (!options.exerciseLibraryItem)
                throw "AddWorkoutFromExerciseLibrary requires an exercise library item";

            this.workout = options.workout;
            this.exerciseLibraryItem = options.exerciseLibraryItem;
            this.set("exerciseLibraryItemId", this.exerciseLibraryItem.id, { silent: true });
            this.set("workoutDateTime", this.workout.get("workoutDay") + " " + this.workout.get("plannedStartTime"));

            this.on("sync", this.onSave, this);
        },

        execute: function()
        {
            return this.save();
        },

        onSave: function()
        {
            this.workout.set(this.get("workoutData"));
        }

    }, { workout: null, exerciseLibraryItem: null });

});