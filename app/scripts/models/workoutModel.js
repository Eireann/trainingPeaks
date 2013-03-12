define(
[
    "moment",
    "TP"
],
function (moment, TP)
{
    var WorkoutModel = TP.APIModel.extend(
    {

        cacheable: true,

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
            "cadenceMaximum": null,
            "lastModifiedDate": null
        },

        getCalendarDay: function()
        {
            return moment(this.get("workoutDay")).format(this.shortDateFormat);
        },

        moveToDay: function(newDate, newCollection)
        {

            var self = this;
            var originalDate = moment(this.get("workoutDay"));
            var originalCollection = self.dayCollection;

            this.set("workoutDay", moment(newDate).format(this.longDateFormat));

            var removeFromSourceCollectionOnSuccess = function()
            {
                if (originalCollection)
                    originalCollection.remove(self);
            };

            var revertOnFailure = function()
            {
                self.set("workoutDay", originalDate.format(this.longDateFormat));
                if (newCollection)
                    newCollection.remove(self);
            };

            if (newCollection)
            {
                newCollection.add(this);
            }

            return this.save().done(removeFromSourceCollectionOnSuccess).fail(revertOnFailure);
        },
        
        copyToClipboard: function()
        {
            var copiedModelAttributes = _.clone(this.attributes, true);

            copiedModelAttributes.workoutId = null;
            //TODO: Finish grooming for copy
            
            return new WorkoutModel(copiedModelAttributes);
        },
        
        cutToClipboard: function ()
        {
            return this;
        },
        
        onPaste: function (dateToPasteTo)
        {
            if (this.id)
            {
                this.moveToDay(dateToPasteTo);
                return this;
            }
            else
            {
                var newWorkout = new WorkoutModel(_.clone(this.attributes, true));
                newWorkout.set("workoutDay", dateToPasteTo.format(this.longDateFormat));
                newWorkout.save();
                return newWorkout;
            }
        }
    });

    return WorkoutModel;
});
