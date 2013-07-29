define(
[
    "moment",
    "TP"
],
function(moment, TP)
{
    return TP.Model.extend(
    {

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/commands/deleteworkouts";
        },

        defaults:
        {
            workoutIds: null
        },

        execute: function()
        {
            return this.save();
        },

        parse: function(response)
        {
            return { resultCount: response };
        }
    });

});