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
                moment(this.get("applyDate")).format("YYYY-MM-DD");
        },

        defaults:
        {
            planId: null,
            applyDate: null
        },

        execute: function()
        {
            return this.save();
        }
    });

});