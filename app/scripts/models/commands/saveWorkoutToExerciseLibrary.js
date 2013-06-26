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
            /*
            athlete id not implemented yet in library controller
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/exerciselibrary/v1/athletes/" + athleteId + "/commands/saveworkouttolibrary";
            */
            return theMarsApp.apiRoot + "/exerciselibrary/v1/commands/saveworkouttolibrary";
        },

        defaults:
        {
            exerciseName: "",
            exerciseLibraryId: 0,
            exerciseLibraryItemId: 0,
            workoutId: 0
        },

        execute: function()
        {
            return this.save();
        },

        parse: function(response)
        {
            return { exerciseLibraryItemId: response };
        }
    });

});