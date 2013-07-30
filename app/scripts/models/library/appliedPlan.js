define(
[
    "moment",   
    "TP"
],
function(moment, TP)
{
    return TP.Model.extend(
    {
        cacheable: true,

        webAPIModelName: "AppliedPlan",
        idAttribute: "appliedPlanId",

        urlRoot: function()
        {
            return theMarsApp.apiRoot + "/plans/v1/appliedplans";
        },

        defaults:
        {
            "appliedPlanId": null
        }
    });
});
