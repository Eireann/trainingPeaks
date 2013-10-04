define(
[
    "underscore",
    "moment",
    "TP"
],
function (_, moment, TP)
{
    var WorkoutDetails = TP.APIDeepModel.extend(
    {
        cacheable: true,

        webAPIModelName: "WorkoutDetails",
        idAttribute: "workoutId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "THH:mm:ss",
        longDateFormat: "YYYY-MM-DDTHH:mm:ss",

        url: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.id + "/details";
        },

        defaults:
        {
            "workoutId": null,
            "timeInHeartRateZones": null,
            "timeInPowerZones": null,
            "timeInSpeedZones": null,
            "meanMaxHeartRates": null,
            "meanMaxPowers": null,
            "meanMaxCadences": null,
            "meanMaxSpeeds": null,
            "workoutDeviceFileInfos": null,
            "attachmentFileInfos": null,
            "workoutStructure": null
        }
    });

    return WorkoutDetails;
});
