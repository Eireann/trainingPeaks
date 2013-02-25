define(
[
    "moment",
    "TP"
],
function (moment, TP)
{
    return TP.APIModel.extend(
    {
        webAPIModelName: "Workout",
        idAttribute: "workoutId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "Thh:mm:ss",
        longDateFormat: "YYYY-MM-DDThh:mm:ss",

        urlRoot: function()
        {
            return theMarsApp.apiRoot + "/WebApiServer/Fitness/V1/workouts";
        },

        defaults:
        {
            "workoutId": null,
            "personId": null,
            "title": null,
            "workoutTypeValueId": null,
            "workoutDay": null,
            "isItAnOr": false,
            "isHidden": null,
            "completed": null,
            "description": null,
            "coachComments": null,
            "workoutComments": null,
            "newComment": null,
            "hasExtension": null,
            "publicSettingValue": 0,
            "makeWorkoutPublic": null,
            "sharedWorkoutInformationKey": null,
            "sharedWorkoutInformationExpireKey": null,
            "distance": null,
            "distancePlanned": null,
            "distanceCustomized": null,
            "distanceUnitsCustomized": null,
            "totalTime": 0,
            "totalTimePlanned": 0,
            "heartRateMinimum": null,
            "heartRateMaximum": null,
            "heartRateAverage": null,
            "calories": null,
            "caloriesPlanned": null,
            "tssActual": null,
            "tssPlanned": null,
            "tssSource": null,
            "if": null,
            "ifPlanned": null,
            "velocityAverage": null,
            "velocityPlanned": null,
            "velocityMaximum": null,
            "normalizedSpeedActual": null,
            "normalizedPowerActual": null,
            "powerAverage": null,
            "powerMaximum": null,
            "energy": null,
            "energyPlanned": null,
            "elevationGain": null,
            "elevationGainPlanned": null,
            "elevationLoss": null,
            "elevationMinimum": null,
            "elevationAverage": null,
            "elevationMaximum": null,
            "torqueAverage": null,
            "torqueMaximum": null,
            "tempMin": null,
            "tempAvg": null,
            "tempMax": null,
            "cadenceAverage": null,
            "cadenceMaximum": null
        },

        getCalendarDay: function()
        {
            return moment(this.get("workoutDay")).format(this.shortDateFormat);
        },

        moveToDay: function(newDate)
        {

            var originalDate = moment(this.get("workoutDay"));
            this.set("workoutDay", moment(newDate).format(this.longDateFormat));

            // on fail, return to old date,
            // return a deferred
            var theWorkout = this;
            return this.save().fail(function()
            {
                theWorkout.set("workoutDay", originalDate);
            });
            
        }

    });
});