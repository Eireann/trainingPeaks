define(
[
    "underscore",
    "moment",
    "TP",
    "models/workoutDetails",
    "models/workoutDetailData"
],
function (_, moment, TP, WorkoutDetailsModel, WorkoutDetailDataModel)
{
    var WorkoutModel = TP.APIDeepModel.extend(
    {
        cacheable: true,

        webAPIModelName: "Workout",
        idAttribute: "workoutId",

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts";
        },

        defaults:
        {
            "workoutId": null,
            "athleteId": null,
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
            "shortUrl": null,
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
            "startTimePlanned": null,
            
            "details": null,
            "detailData": null
        },

        initialize: function(attrs, options)
        {
            this.myBackboneModelPrototype.initialize.apply(this, arguments);
            _.bindAll(this, "checkpoint", "revert");

            this.set("details", new WorkoutDetailsModel({ workoutId: this.get("workoutId") }, options));
            this.set("detailData", new WorkoutDetailDataModel({ workoutId: this.get("workoutId") }, options));

            // for newly added workouts, or else opening the qv again passes null to endpoint url
            this.on("change:workoutId", function()
            {
                this.get("details").set("workoutId", this.get("workoutId"));
                this.get("detailData").set("workoutId", this.get("workoutId"));
            }, this);
        },
        
        checkpoint: function()
        {
            this.checkpointAttributes = _.clone(this.attributes);

            // details checkpoint
            this.get("details").checkpoint();
            delete this.checkpointAttributes.details;

            // probably no need for checkpoint/revert here?
            //this.get("detailData").checkpoint();
            delete this.checkpointAttributes.detailData;

        },
        
        revert: function()
        {
            if (this.checkpointAttributes && !_.isEmpty(this.checkpointAttributes) && !_.isEqual(this.attributes, this.checkpointAttributes))
            {
                this.set(this.checkpointAttributes);
                this.save();

                this.get("details").revert();

                // not needed until we can edit detailData
                //this.get("detailData").revert();

            }
        },

        getCalendarDay: function()
        {
            return moment(this.get("workoutDay")).format(TP.utils.datetime.shortDateFormat);
        },

        _createSortDate: function()
        {
            this.sortDate = this.getCalendarDay();
        },

        getSortDate: function()
        {
            if(!this.sortDate)
            {
                this._createSortDate();
                this.on("change:workoutDay", this._createSortDate, this);
            }

            return this.sortDate;
        },

        // QL: Should be handled by calendar collection by watching workoutDay
        // attribute
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
                "athleteId",
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

                if (this.has("workoutComments") && this.get("workoutComments").length)
                {
                    this.postActivityComments.set(this.get("workoutComments"));
                }
            }
            return this.postActivityComments;
        },

        parse: function(response)
        {
            this.getPostActivityComments().set(response.workoutComments);
            return response;
        },

        toJSON: function(options)
        {
            var attributes = {};

            // don't post details or detailData as part of saving workout tier 1
            // do save workoutComments, but handle them separately
            var attributesToExclude = ["details", "detailData", "workoutComments"];

            _.each(_.keys(this.attributes), function(attributeName)
            {
                if(!_.contains(attributesToExclude, attributeName))
                {
                    attributes[attributeName] = _.deepClone(this.attributes[attributeName]);
                }
            }, this);

            attributes.workoutComments = new TP.Collection(this.attributes.workoutComments).toJSON();

            return attributes;
        }

    });

    return WorkoutModel;
});
