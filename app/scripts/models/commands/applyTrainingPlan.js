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
            return theMarsApp.apiRoot + "/plans/v1/athletes/" + theMarsApp.user.getCurrentAthleteId() 
                + "/commands/apply/" + this.get("planId") + "/"
                + moment(this.get("applyDate")).format("YYYY-MM-DD");
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