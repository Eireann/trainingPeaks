define(
[
    "underscore",
    "moment",
    "TP"
],
function (_, moment, TP)
{
    var WorkoutDetails = TP.APIModel.extend(
    {
        cacheable: true,

        webAPIModelName: "WorkoutDetails",
        idAttribute: "workoutId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "Thh:mm:ss",
        longDateFormat: "YYYY-MM-DDThh:mm:ss",

        url: function()
        {
            var athleteId = theMarsApp.user.get("athletes.0.athleteId");
            return theMarsApp.apiRoot + "/WebApiServer/fitness/v1/athletes/" + athleteId + "/workouts/" + this.id + "/details";
        },

        defaults:
        {
            "workoutId": null,
            "timeInHeartRateZones": null,
            "timeInPowerZones": null,
            "timeInSpeedZones": null,
            "meanMaxHeartRate": null,
            "meanMaxPower": null,
            "meanMaxCadence": null,
            "meanMaxSpeed": null,
            "workoutDeviceFileInfos": null,
            "attachmentFileInfos": null
        },

        initialize: function()
        {
            TP.APIModel.prototype.initialize.apply(this, arguments);
        }
    });

    return WorkoutDetails;
});
