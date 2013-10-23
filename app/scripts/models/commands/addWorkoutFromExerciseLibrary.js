define(
[
    "TP",
    "views/userConfirmationView",
    "hbs!shared/templates/failedToSaveTemplate"
],
function(
    TP,
    UserConfirmationView,
    failedToSaveTemplate
)
{

    return TP.Model.extend(
    {

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/commands/addworkoutfromlibraryitem";
        },

        defaults:
        {
            exerciseLibraryItemId: 0,
            workoutDateTime: null,
            workoutData: {}
        },

        initialize: function(attributes, options)
        {
            if (!options.workout)
                throw new Error("AddWorkoutFromExerciseLibrary requires a workout model");

            if (!options.exerciseLibraryItem)
                throw new Error("AddWorkoutFromExerciseLibrary requires an exercise library item");

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
            var promise = this.save();

            var self = this;
            promise.fail(function() {
                self.workout.destroy();

                var dialog = new UserConfirmationView({ template: failedToSaveTemplate });
                dialog.render();
            });

            return promise;
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
