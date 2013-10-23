define(
[
    "underscore",
    "moment",
    "TP",
    "utilities/charting/dataParser",
    "models/workoutStatsForRange",
    "utilities/workout/formatPeakTime",
    "utilities/workout/formatPeakDistance",
    "models/commands/saveWorkoutDetailData"
],
function (
    _,
    moment,
    TP,
    DataParser,
    WorkoutStatsForRange,
    formatPeakTime,
    formatPeakDistance,
    SaveWorkoutDetailDataCommand
    )
{
    var WorkoutDetailData = TP.APIBaseModel.extend(
    {
        cacheable: false,

        webAPIModelName: "WorkoutDetailData",
        idAttribute: "workoutId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "THH:mm:ss",
        longDateFormat: "YYYY-MM-DDTHH:mm:ss",

        initialize: function()
        {
            this._dataParser = new DataParser();
            this.rangeCollections = {};
            this.reset();
            this.on("sync", this.reset, this);
        },

        reset: function()
        {
            this._resetDataParser();
            this._setOriginalLapsStats();
            this._resetRangesForLaps();

            // set channels last as some views may be watching for events, make sure data parser and laps stats are already in correct state
            this._resetChannels();
            this.trigger("reset");
        },

        undoEdits: function()
        {
            this._resetDataParser();
            this._resetLapEdits();
            this._resetRangesForLaps();

            // set channels last as some views may be watching for events, make sure data parser and laps stats are already in correct stat
            this._resetChannels();
            this.trigger("reset");
        },

        _resetDataParser: function()
        {
            this._dataParser.resetExcludedChannels();
            this._dataParser.loadData(this.get("flatSamples"));
        },

        _setOriginalLapsStats: function()
        {
            this.set("lapsStatsEdited", false);
            this.set("lapDeleted", false);
            this.set("originalLapsStats", this.has("lapsStats") ? _.clone(this.get("lapsStats")) : null);
        },

        _resetLapEdits: function()
        {   // reset laps?
            if(this.get("lapsStatsEdited") || this.get("lapDeleted"))
            {
                this.set("lapsStatsEdited", false);
                this.set("lapDeleted", false);
                this.set("lapsStats", this.get("originalLapsStats"));
            }
        },

        _resetRangesForLaps: function()
        {
            if(this.rangeCollections.hasOwnProperty("laps"))
            {
                this.getRangeCollectionFor("laps").reset(this._augmentRanges(this.get("lapsStats"), "laps"));
            }
        },

        _resetChannels: function()
        {
            this.set("channelCuts", null);
            this.set("disabledDataChannels", []);
            this.set("availableDataChannels", this.has("flatSamples") ? this.get("flatSamples").channelMask : []);
        },

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
            "lapsStats": null,
            "meanMaxHeartRates": null,
            "meanMaxPowers": null,
            "meanMaxSpeeds": null,
            "availableDataChannels": null,
            "disabledDataChannels": null,
            "channelCuts": null,
            "lapsStatsEdited": false,
            "lapDeleted": false,
            "originalLapsStats": null
        },

        getDataParser: function()
        {
            return this._dataParser;
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
        },

        _rangeKeys:
        {
            laps: "lapsStats",
            distance: "peakSpeedsByDistance",
            power: "peakPowers",
            heartrate: "peakHeartRates",
            speed: "peakSpeeds",
            pace: "peakSpeeds",
            cadence: "peakCadences"
        },

        _rangeEvents:
        {
            laps: {
                "change:name": "_flagLapsAsEdited",
                "lap:markedAsDeleted": "_flagLapAsDeleted"
            }
        },

        getRangeCollectionFor: function(rangeType)
        {
            var collection = this.rangeCollections[rangeType];
            var data;
            if(collection)
            {
                data = collection.select(function(lapStat) { return lapStat.get('deleted') || false; });
                _.each(data, function(model)
                {
                    collection.remove(model, {silent: true});
                });
            }
            else
            {
                data = this._getRangeDataFor(rangeType);
                collection = new TP.Collection(data, { model: WorkoutStatsForRange });
                this.rangeCollections[rangeType] = collection;
                this._watchRangeDataFor(rangeType, _.bind(collection.set, collection));
                this._watchRangeCollectionEvents(collection, rangeType);
            }
            return collection;

        },

        disableChannel: function(series)
        {
            var disabledSeries = this.get("disabledDataChannels");
            this.set("disabledDataChannels", _.union(disabledSeries, [series]));
        },

        enableChannel: function(series)
        {
            this.set("disabledDataChannels", _.without(this.get("disabledDataChannels"), series));
        },

        _addAvailableChannel: function(series)
        {
            var availableSeries = this.get("availableDataChannels");
            availableSeries.push(series);
            this.set("availableDataChannels", _.uniq(availableSeries));
        },

        _removeAvailableChannel: function(series)
        {
            this.set("availableDataChannels", _.without(this.get("availableDataChannels"), series));
        },

        cutChannel: function(series)
        {
            var channelCutDetails = {
                channel: series,
                startTimeInMilliseconds: _.first(this.get("flatSamples").msOffsetsOfSamples),
                endTimeInMilliseconds: _.last(this.get("flatSamples").msOffsetsOfSamples)
            };
            var channelCuts = this.has("channelCuts") ? this.get("channelCuts") : [];
            channelCuts.push(channelCutDetails);

            // update data parser before updating our own attributes, in case anybody is watching for changes on this model, data parser should already be in correct state
            this._dataParser.excludeChannel(series);
            this.set("channelCuts", channelCuts);
            this.disableChannel(series);
            this._removeAvailableChannel(series);
        },

        channelWasCut: function(series)
        {
            var matchingChannelCut = _.find(this.get("channelCuts"), function(channelCut)
            {
                return channelCut.channel === series;
            });

            return matchingChannelCut ? true : false;
        },

        hasEdits: function()
        {
            return this.has("channelCuts") || this.get("lapsStatsEdited") || this.get("lapDeleted");
        },

        saveEdits: function()
        {
            var params =
            {
                channelCuts: this._getChannelCuts(),
                lapsStats: this._getEditedLapsStats()
            };

            var command = new SaveWorkoutDetailDataCommand(params);
            command.workoutId = this.get('workoutId');
            return command.execute()
                .done(_.bind(this._afterSaveEdits, this));
        },

        _afterSaveEdits: function()
        {
            this.set("flatSamples", null, {silent: true});
            this.fetch();
            this.trigger("after:saveEdits");
        },

        _getChannelCuts: function()
        {
            return this.get("channelCuts");
        },

        _getEditedLapsStats: function()
        {
            if(this.get("lapsStatsEdited") || this.get("lapDeleted"))
            {
                return this.getRangeCollectionFor("laps").toJSON();
            }
            else
            {
                return null;
            }
        },

        _getRangeDataFor: function(rangeType, onChange)
        {

            var key = this._rangeKeys[rangeType];
            if(!key)
            {
                throw new Error("Unknown range type: " + rangeType);
            }

            var ranges = this.get(key);

            if(rangeType !== "laps")
            {
                ranges = this._processPeaks(ranges, rangeType);
            }

            return this._augmentRanges(ranges, rangeType);

        },

        _watchRangeDataFor: function(rangeType, callback)
        {
            var key = this._rangeKeys[rangeType];
            this.on("change:" + key, function(model, value, options)
            {
                value = this._augmentRanges(value, rangeType);
                callback(value);
            });

        },

        _watchRangeCollectionEvents: function(collection, rangeType)
        {
            if(!this._rangeEvents.hasOwnProperty(rangeType))
            {
                return;
            }

            var events = this._rangeEvents[rangeType];

            _.each(events, function(methodName, eventName)
            {
                this.listenTo(collection, eventName, _.bind(this[methodName], this));
            }, this);
        },

        _augmentRanges: function(ranges, rangeType)
        {
            var defaults =
            {
                workoutId: this.get("workoutId"),
                hasLoaded: rangeType === "laps",
                isLap: rangeType === "laps"
            };
            return _.map(ranges, function(range)
            {
                return _.extend({}, defaults, range);
            });
        },

        _processPeaks: function(ranges, rangeType)
        {
            ranges = _.sortBy(ranges, "interval");
            ranges = _.uniq(ranges, true, "interval");

            ranges = _.map(ranges, function(range)
            {

                range = _.clone(range);
                if(rangeType === "distance")
                {
                    range.name = "Peak " + formatPeakDistance(range.interval);
                }
                else
                {
                    range.name = "Peak " + formatPeakTime(range.interval);
                }
                return range;

            });

            return ranges;
        },

        _flagLapsAsEdited: function()
        {
            this.set("lapsStatsEdited", true);
        },

        _flagLapAsDeleted: function()
        {
            this.set("lapDeleted", true);
        }
    });

    return WorkoutDetailData;
});
