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
            return theMarsApp.apiRoot + "/WebApiServer/ExerciseLibrary/V1/commands/saveworkouttolibrary";
        },

        defaults: function()
        {
            return {
                exerciseName: "",
                exerciseLibraryId: 0,
                exerciseLibraryItemId: 0,
                workoutId: 0
            };
        },

        execute: function()
        {
            return this.save();
        }
    });

});