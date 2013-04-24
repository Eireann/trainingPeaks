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
            var athleteId = theMarsApp.user.get("athletes.0.athleteId");
            return theMarsApp.apiRoot + "/WebApiServer/exerciselibrary/v1/athletes/" + athleteId + "/commands/saveworkouttolibrary";
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