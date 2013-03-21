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
            return theMarsApp.apiRoot + "/WebApiServer/Fitness/V1/commands/shiftworkouts";
        },

        defaults: function()
        {
            return {
                athleteId: theMarsApp.user.has("userId") ? theMarsApp.user.get("userId") : 0,
                startDate: null,
                endDate: null,
                days: null,
                resultCount: 0
            };
        },

        execute: function()
        {
            return this.save();
        }
    });

});