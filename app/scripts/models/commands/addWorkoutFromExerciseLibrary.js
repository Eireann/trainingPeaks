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
            var workoutDateTime = this.workout.get("workoutDay");
            if (this.workout.get("startTimePlanned"))
            {
                workoutDateTime += " " + this.workout.get("startTimePlanned");
            }
            this.set("workoutDateTime", workoutDateTime);

            this.on("sync", this.onSave, this);
        },

        execute: function()
        {
            return this.save();
        },

        onSave: function()
        {
            this.workout.set(this.get("workoutData"));
        },

        parse: function(response)
        {
            return { workoutData: response };
        }

    }, { workout: null, exerciseLibraryItem: null });

});