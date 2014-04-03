define(
[
    "jquery",
    "underscore",
    "moment",
    "TP",
    "shared/data/equipmentTypes",
    "models/workoutDetails",
    "models/workoutDetailData",
    "shared/utilities/autosaveMergeUtility"
],
function (
    $,
    _,
    moment,
    TP,
    EquipmentTypes,
    WorkoutDetailsModel,
    WorkoutDetailDataModel,
    AutosaveMergeUtility
)
{
    var WorkoutModel = TP.APIBaseModel.extend(
    {
        cacheable: true,

        webAPIModelName: "Workout",
        idAttribute: "workoutId",

        urlRoot: function()
        {
            var athleteId = this._getUser().getCurrentAthleteId();
            return this._getApiRoot() + "/fitness/v1/athletes/" + athleteId + "/workouts";
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
            "detailData": null,
            "equipmentBikeId": null,
            "equipmentShoeId": null,
            "isLocked": null
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

            this.equipment = (options && options.equipment) || null;

            this.options = options;
        },

        autosave: AutosaveMergeUtility.mixin.autosave,
        parse: function()
        {
            var data = AutosaveMergeUtility.mixin.parse.apply(this, arguments);

            if(data.startTime)
            {
                // remove time zone offset value and assume it is a local time
                data.startTime = data.startTime.replace(/:[\d\.]+[+|-]\d\d:\d\d$/,'');
            }

            if(this.postActivityComments)
            {
                this.postActivityComments.set(data.workoutComments);
            }
            return data;
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

        dropped: function(options)
        {
            if(options && options.date)
            {
                this._getActivityMover().dropActivityOnDay(this, options.date); 
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
                "elevationGainPlanned",
                "startTimePlanned"
            ];

            return new WorkoutModel(this.pick(attributesToCopy));
        },

        pasted: function(options)
        {

            if(options && options.date)
            {
                this._getActivityMover().pasteActivityToDay(this, options.date);
            }
            else
            {
                console.warn("Don't know how to paste to target");
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
        },

        _getActivityMover: function()
        {
            return this.options && this.options.activityMover ? this.options.activityMover : theMarsApp.activityMover;
        }

    });

    return WorkoutModel;
});
