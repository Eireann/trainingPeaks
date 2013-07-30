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
            return theMarsApp.apiRoot + "/plans/v1/commands/removeplan";
        },

        defaults:
        {
            appliedPlanId: null
        },

        execute: function()
        {
            return this.save();
        }
    });

});