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
            return theMarsApp.apiRoot + "/plans/v1/commands/applyplan";
        },

        defaults:
        {
            athleteId: null, 
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