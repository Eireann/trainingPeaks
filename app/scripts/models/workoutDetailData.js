﻿define(
[
    "underscore",
    "moment",
    "TP"
],
function (_, moment, TP)
{
    var WorkoutDetailData = TP.APIModel.extend(
    {
        cacheable: false,

        webAPIModelName: "WorkoutDetailData",
        idAttribute: "workoutId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "Thh:mm:ss",
        longDateFormat: "YYYY-MM-DDThh:mm:ss",

        url: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.id + "/detaildata";
        },

        defaults:
        {
            "workoutId": null,
            "flatSamples": null,
            "rangesStats": null,
            "peakCadences": null,
            "peakHeartRates": null,
            "peakPowers": null,
            "peakSpeeds": null,
            "peakSpeedsByDistance": null,
            "sampleRate": null,
            "totalStats": null,
            "lapsStats": null
        }
    });

    return WorkoutDetailData;
});
