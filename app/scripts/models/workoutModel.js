define(
[
    "jquery",
    "underscore",
    "moment",
    "TP",
    "models/workoutDetails",
    "models/workoutDetailData"
],
function ($, _, moment, TP, WorkoutDetailsModel, WorkoutDetailDataModel)
{
    var WorkoutModel = TP.APIBaseModel.extend(
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
            "date": null,
            "details": null,
            "detailData": null
        },

        initialize: function(attrs, options)
        {
            this.constructor.__super__.initialize.apply(this, arguments);
            _.bindAll(this, "checkpoint", "revert");

            this.set("details", new WorkoutDetailsModel({ workoutId: this.get("workoutId") }, options));
            this.set("detailData", new WorkoutDetailDataModel({ workoutId: this.get("workoutId") }, options));

            this.listenTo(this.get("detailData"), "after:saveEdits", _.bind(this.onSaveDetailDataEdits, this));

            // for newly added workouts, or else opening the qv again passes null to endpoint url
            this.on("change:workoutId", function()
            {
                this.get("details").set("workoutId", this.get("workoutId"));
                this.get("detailData").set("workoutId", this.get("workoutId"));
            }, this);
        },

        // Override:
        // If save has been called on a new object, delay any further calls
        // until it fails or we have an id (otherwise multiple object will be
        // created).
        // WARNING: When a save is delayed only a jQuery Deferred is
        // returned NOT a full jqXHR.
        save: function()
        {
            var self = this, args = arguments;

            if(this._xhr && this._xhr.state() === "pending")
            {
                var deferred = $.Deferred();
                this._xhr.always(function() { self.save.apply(self, args).then(deferred.resolve, deferred.reject, deferred.progress); });
                return deferred.promise();
            }

            var xhr = TP.APIBaseModel.prototype.save.apply(this, args);
            if(this.isNew())
            {
                this._xhr = xhr;
                xhr.always(function() { self._xhr = undefined; });
            }
            return xhr;
        },
        
        checkpoint: function()
        {
            this.checkpointAttributes = _.clone(this.attributes);

            // handle details checkpoint separately
            //this.get("details").checkpoint();
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

                // handle details revert separately
                //this.get("details").revert();

                // not needed until we can edit detailData
                //this.get("detailData").revert();

            }
        },

        getCalendarDay: function()
        {
            var workoutDay = this.get("workoutDay");
            if(workoutDay)
            {
                return moment(workoutDay).format(TP.utils.datetime.shortDateFormat);
            }
            else
            {
                return "";
            }
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

        moveToDay: function(newDate)
        {
            var attrs =
            {
                workoutDay: moment(newDate).format(TP.utils.datetime.longDateFormat)
            };
            return this.save(attrs, { wait: true });
        },

        dropped: function(options)
        {
            if(options && options.date)
            {
                theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                    theMarsApp.featureAuthorizer.features.SaveWorkoutToDate, 
                    _.bind(function(){this.moveToDay(options.date);}, this),
                    {targetDate: options.date}
                );
            }
        },

        cloneForCopy: function()
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

            return new WorkoutModel(this.pick(attributesToCopy));
        },

        pasted: function(options)
        {

            if(options.date)
            {
                theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                    theMarsApp.featureAuthorizer.features.SaveWorkoutToDate, 
                    _.bind(this._applyPaste, this, options),
                    { targetDate: options.date }
                );
            }
            else
            {
                console.warn("Don't know how to paste to target");
            }

        },

        _applyPaste: function(options)
        {
            var date = options.date;
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            if(this.isNew())
            {
                var workout = this.clone();
                workout.save(
                {
                    workoutDay: date,
                    athleteId: athleteId
                });
                theMarsApp.calendarManager.addItem(workout);
            }
            // Cut workout for different athlete should be ignored
            else if(this.get("athleteId") === athleteId)
            {
                this.moveToDay(date);
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
        },

        onSaveDetailDataEdits: function()
        {
            this.fetch();
            this.get("details").fetch();
        }

    });

    return WorkoutModel;
});
