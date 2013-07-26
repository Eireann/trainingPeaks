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
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/plans/v1/athletes/" + athleteId + "/appliedplans";
        },

        defaults:
        {
            "appliedPlanId": null,
        }
    });
});
