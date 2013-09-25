define(
[
    "underscore",
    "moment",
    "TP"
],
function (_, moment, TP)
{
    var WorkoutDetailData = TP.APIBaseModel.extend(
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
            "workoutId": null, //x, duh
            "flatSamples": null,
            "rangesStats": null,
            "peakCadences": null,
            "peakHeartRates": null,
            "peakPowers": null,
            "peakSpeeds": null,
            "peakSpeedsByDistance": null,
            "sampleRate": null,
            "totalStats": null,
            "lapsStats": null,
            "meanMaxHeartRates": null,
            "meanMaxPowers": null,
            "meanMaxSpeeds": null
        },

        hasSensorData: function()
        {
            return this.hasLaps() || this.hasSamples();
        },

        hasSamples: function()
        {
            // return this.has("flatSamples.samples") && this.get("flatSamples.samples").length > 0;
            return this.has("flatSamples") && this.get("flatSamples").samples && this.get("flatSamples").samples.length > 0;
        },

        hasLaps: function()
        {
            return this.has("lapsStats") && this.get("lapsStats").length > 1;
        },

        watchForSensorData: function()
        {
            this.on("change:flatSamples", this.triggerSensorDataChange, this);
            this.on("change:lapsStats", this.triggerSensorDataChange, this);
        },

        triggerSensorDataChange: function()
        {
            this.trigger("changeSensorData", this);
        }
    });

    return WorkoutDetailData;
});
