define(
[
    "TP"
],
function(TP)
{
    return TP.APIModel.extend(
    {
        cacheable: true,

        webAPIModelName: "AthleteSettings",
        idAttribute: "athleteId",

        defaults:
        {
            athleteId: 0
        },

        url: function()
        {
            var athleteSettingsUrl = "fitness/v1/athletes/" + theMarsApp.user.getAthleteId() + "/settings";
            return theMarsApp.apiRoot + "/WebApiServer/" + athleteSettingsUrl;
        }

    });
});