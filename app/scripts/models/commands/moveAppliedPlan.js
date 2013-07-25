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
            return theMarsApp.apiRoot + "/plans/v1/athletes/" + athleteId + "/commands/moveAppliedPlan";
        },

        defaults:
        {
            appliedPlanId: null,
            startType: null,
            targetDate: null,
            moveGoal: true
        },

        execute: function()
        {
            return this.save();
        }
    });
});