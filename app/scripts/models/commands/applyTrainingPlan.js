define(
[
    "moment",
    "TP"
],
function(moment, TP)
{
    return TP.Model.extend(
    {

        url: function()
        {
            return theMarsApp.apiRoot + "/plans/v1/athletes/" + theMarsApp.user.getCurrentAthleteId() +
                "/plans/" + this.get("planId") + "/commands/apply/" +
                this.get("applyDateType") + "/" +
                moment(this.get("applyDate")).format("YYYY-MM-DD");
        },

        defaults:
        {
            planId: null,
            applyDate: null,
            applyDateType: null,
            appliedPlan: null
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