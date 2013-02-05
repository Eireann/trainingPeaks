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
        idAttribute: "WorkoutId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "Thh:mm:ss",
        longDateFormat: "YYYY-MM-DDThh:mm:ss",

        defaults:
        {
            "WorkoutId": 0,
            "PersonId": null,
            "Title": null,
            "WorkoutTypeValueId": null,
            "WorkoutDay": null,
            "IsItAnOr": false,
            "IsHidden": null,
            "Completed": null,
            "Description": null,
            "CoachComments": null,
            "WorkoutComments": null,
            "NewComment": null,
            "HasExtension": null,
            "PublicSettingValue": 0,
            "MakeWorkoutPublic": null,
            "SharedWorkoutInformationKey": null,
            "SharedWorkoutInformationExpireKey": null,
            "Distance": null,
            "DistancePlanned": null,
            "DistanceCustomized": null,
            "DistanceUnitsCustomized": null,
            "TotalTime": null,
            "TotalTimePlanned": null,
            "HeartRateMinimum": null,
            "HeartRateMaximum": null,
            "HeartRateAverage": null,
            "Calories": null,
            "CaloriesPlanned": null,
            "TSSActual": null,
            "TSSPlanned": null,
            "IF": null,
            "IFPlanned": null,
            "VelocityAverage": null,
            "VelocityPlanned": null,
            "VelocityMaximum": null,
            "NormalizedSpeedActual": null,
            "NormalizedPowerActual": null,
            "PowerAverage": null,
            "PowerMaximum": null,
            "Energy": null,
            "EnergyPlanned": null,
            "ElevationGain": null,
            "ElevationGainPlanned": null,
            "ElevationLoss": null,
            "ElevationMinimum": null,
            "ElevationAverage": null,
            "ElevationMaximum": null,
            "TorqueAverage": null,
            "TorqueMaximum": null,
            "TempMin": null,
            "TempAvg": null,
            "TempMax": null,
            "CadenceAverage": null,
            "CadenceMaximum": null
        },
        
        url: function()
        {
            return theMarsApp.apiRoot + "/WebApiServer/Fitness/V1/workouts";
        },

        getCalendarDay: function()
        {
            return moment(this.get("WorkoutDay")).format(this.shortDateFormat);
        },

        moveToDay: function(newDate)
        {

            var originalDate = moment(this.get("WorkoutDay"));
            this.set("WorkoutDay", moment(newDate).format(this.longDateFormat));

            // on fail, return to old date,
            // return a deferred
            var theWorkout = this;
            return this.save().fail(function()
            {
                theWorkout.set("WorkoutDay", originalDate);
            });
            
        }

    });
});