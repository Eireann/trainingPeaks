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
            return theMarsApp.apiRoot + "/plans/v1/athletes/" + theMarsApp.user.getCurrentAthleteId() +
                "/plans/commands/apply/";
        },

        defaults:
        {
            planId: null,
            targetDate: null,
            startType: null
        },

        execute: function()
        {
            return this.save();
        },

        parse: function(results)
        {
            return { appliedPlan: results };
        }
    });

});