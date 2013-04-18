define(
[
    "underscore",
    "moment",
    "TP"
],
function (_, moment, TP)
{
    var WorkoutModel = TP.APIModel.extend(
    {

        cacheable: true,

        webAPIModelName: "Workout",
        idAttribute: "workoutId",

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
            "code": null,
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
            "totalTime": null,
            "totalTimePlanned": null,
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
            "lastModifiedDate": null,
            "startTime": null,
            "startTimePlanned": null
        },

        initialize: function()
        {
            TP.APIModel.prototype.initialize.apply(this, arguments);
            _.bindAll(this, "checkpoint", "revert");
        },
        
        checkpoint: function()
        {
            this.checkpointAttributes = _.clone(this.attributes);
        },
        
        revert: function()
        {
            if (this.checkpointAttributes && !_.isEmpty(this.checkpointAttributes) && !_.isEqual(this.attributes, this.checkpointAttributes))
            {
                this.set(this.checkpointAttributes);
                this.save();
            }
        },
        
        getCalendarDay: function()
        {
            return moment(this.get("workoutDay")).format(TP.utils.datetime.shortDateFormat);
        },

        moveToDay: function(newDate, newCollection)
        {

            var self = this;
            var originalDate = moment(this.get("workoutDay"));
            var originalCollection = this.dayCollection;

            this.set("workoutDay", moment(newDate).format(TP.utils.datetime.longDateFormat));
            if (newCollection)
            {
                newCollection.add(this);
                this.dayCollection = newCollection;
            }
            if (originalCollection)
            {
                originalCollection.remove(this);
            }

            var revertOnFailure = function()
            {
                self.set("workoutDay", originalDate.format(TP.utils.datetime.longDateFormat));
                if (newCollection)
                    newCollection.remove(self);
                if (originalCollection) {
                    originalCollection.add(self);
                    self.dayCollection = originalCollection;
                }
            };

            return this.save().fail(revertOnFailure);
        },
        
        copyToClipboard: function()
        {
            var attributesToCopy = [
                "personId",
                "title",
                "workoutTypeValueId",
                "workoutDay",
                "isItAnOr",
                "description",
                "distancePlanned",
                "totalTimePlanned",
                "caloriesPlanned",
                "tssPlanned",
                "ifPlanned",
                "velocityPlanned",
                "energyPlanned",
                "elevationGainPlanned"
            ];

            var copiedModelAttributes = {};
            var self = this;
            _.each(attributesToCopy, function(attributeName)
            {
                copiedModelAttributes[attributeName] = self.get(attributeName);
            });

            return new WorkoutModel(copiedModelAttributes);
        },
        
        cutToClipboard: function ()
        {
            return this;
        },

        onPaste: function(dateToPasteTo)
        {
            if (this.id)
            {
                if (moment(dateToPasteTo).format(TP.utils.datetime.shortDateFormat) !== this.getCalendarDay())
                {
                    this.moveToDay(dateToPasteTo);
                    return this;
                } else
                {
                    return null;
                }
            }
            else
            {
                var newWorkout = new WorkoutModel(_.clone(this.attributes, true));
                var workoutDateMoment = moment(dateToPasteTo);
                var formattedWorkoutDate = workoutDateMoment.format(TP.utils.datetime.longDateFormat);
                newWorkout.set("workoutDay", formattedWorkoutDate);
                newWorkout.save();
                return newWorkout;
            }
        },

        getPostActivityComments: function()
        {
            if (!this.postActivityComments)
            {
                this.postActivityComments = new TP.Collection();
            }
            return this.postActivityComments;
        },

        parse: function(response)
        {
            this.getPostActivityComments().set(response.workoutComments);
            return response;
        },

        toJSON: function(options) {
            var attributes = _.deepClone(this.attributes);
            attributes.workoutComments = this.getPostActivityComments().toJSON();
            return attributes;
        }

    });

    return WorkoutModel;
});
