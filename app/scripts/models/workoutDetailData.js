define(
[
    "underscore",
    "moment",
    "TP",
    "utilities/charting/graphData",
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
    GraphData,
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
            this.graphData = new GraphData({ detailData: this });
            this._dataParser = new DataParser({graphData: this.graphData});
            this.rangeCollections = {};
            this.reset();
            this.on("sync", this.reset, this);
        },

        url: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts/" + this.id + "/detaildata";
        },

        defaults:
        {
            "workoutId": null,
            "uploadedFileId": null,
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

        parse: function(data)
        {
            var original = data.flatSamples;
            if(original)
            {
                var modified = {};
                var channels = _.indexBy(original.channels, "name");

                modified.msOffsetsOfSamples = channels.MillisecondOffset.samples;

                modified.channelMask = _.pluck(original.channels, "name");
                modified.samples = _.zip.apply(_, _.pluck(original.channels, "samples"));
                modified.samples = _.map(modified.samples, function(sample) { return { values: sample }; });
                modified.hasLatLngData = original.hasLatLngData;

                data.flatSamples = modified;
            }

            return data;
        },

        reset: function()
        {
            this._batchChanges(function()
            {
                this._resetDataParser();
                this._setOriginalLapsStats();
                this._resetRangeDataForLaps();

                // set channels last as some views may be watching for events, make sure data parser and laps stats are already in correct state
                this._resetChannels();
            });

            this._resetStateForLaps();

            this.trigger("reset");
        },

        undoEdits: function()
        {
            this._batchChanges(function()
            {
                this._resetDataParser();
                this._resetLapEdits();
                this._resetRangeDataForLaps();

                // set channels last as some views may be watching for events, make sure data parser and laps stats are already in correct stat
                this._resetChannels();
            });

            this._resetStateForLaps();

            this.trigger("reset");
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

        cutChannel: function(series)
        {
            this.cutRange(series, _.first(this.get("flatSamples").msOffsetsOfSamples), _.last(this.get("flatSamples").msOffsetsOfSamples), true);
        },

        cutAllChannelsForRange: function(begin, end)
        {
            this.cutRange("AllChannels", begin, end);
            this._markCutLaps(begin, end);
        },

        cutRange: function(series, begin, end, isFullChannel)
        {
            this._batchChanges(function()
            {
                var channelCutDetails = {
                    channel: series,
                    startTimeInMilliseconds: begin,
                    endTimeInMilliseconds: end
                };
                var channelCuts = this.has("channelCuts") ? _.clone(this.get("channelCuts")) : [];
                channelCuts.push(channelCutDetails);

                // update data parser before updating our own attributes, in case anybody is watching for changes on this model, data parser should already be in correct state
                if(isFullChannel)
                {
                    this.graphData.excludeChannel(series);
                }
                else
                {
                    this.graphData.excludeRange(series, begin, end);
                }
                this.set("channelCuts", channelCuts);
                this.disableChannel(series);
                this._removeAvailableChannel(series);
            });
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

            var command = new SaveWorkoutDetailDataCommand(params, { workoutId: this.get('workoutId'), uploadedFileId: this.get('uploadedFileId')});
            return command.execute()
                .done(_.bind(this._afterSaveEdits, this));
        },

        getRangeCollectionFor: function(rangeType)
        {
            var collection = this.rangeCollections[rangeType];

            if(!collection)
            {
                var data = this._getRangeDataFor(rangeType);
                data = this._augmentRangeData(data, rangeType);
                collection = new TP.Collection(data, { model: WorkoutStatsForRange });
                this.rangeCollections[rangeType] = collection;
                this._augmentRangeState(collection, rangeType);
                this._watchRangeDataFor(rangeType, collection);
                this._watchRangeCollectionEvents(collection, rangeType);
            }
            return collection;

        },

        watchForSensorData: function()
        {
            this.on("change:flatSamples change:lapsStats", this._triggerSensorDataChange, this);
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
                "add": "_flagLapsAsEdited",
                "change:name": "_flagLapsAsEdited",
                "state:change:isDeleted": "_flagLapAsDeleted"
            }
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

        _afterSaveEdits: function()
        {
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
                var lapsCollection = this.getRangeCollectionFor("laps");
                this._removeDeletedLaps(lapsCollection);
                return lapsCollection.toJSON();
            }
            else
            {
                return null;
            }
        },

        _removeDeletedLaps: function(lapsCollection)
        {
            var deletedLaps = lapsCollection.select(function(lapStat) { return lapStat.getState().get('isDeleted') || false; });
            _.each(deletedLaps, function(model)
            {
                lapsCollection.remove(model, {silent: true});
            });
        },

        _getRangeDataFor: function(rangeType, onChange)
        {

            var key = this._rangeKeys[rangeType];
            if(!key)
            {
                throw new Error("Unknown range type: " + rangeType);
            }

            return this.get(key);
        },

        _watchRangeDataFor: function(rangeType, collection)
        {
            var key = this._rangeKeys[rangeType];
            this.on("change:" + key, function(model, value, options)
            {
                value = this._augmentRangeData(value, rangeType);
                collection.set(value);
                this._augmentRangeState(collection, rangeType);
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

        _augmentRangeData: function(ranges, rangeType)
        {
            var defaults =
            {
                workoutId: this.get("workoutId"),
                hasLoaded: rangeType === "laps"
            };

            if(rangeType !== "laps")
            {
                ranges = this._processPeaks(ranges, rangeType);
            }

            return _.map(ranges, function(range)
            {
                return _.extend({}, defaults, range);
            });
        },

        _augmentRangeState: function(rangeCollection, rangeType)
        {
            var defaultState =
            {
                isLap: rangeType === "laps"
            };

            rangeCollection.each(function(model)
            {
                model.getState().set(defaultState);
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
        },

        _markCutLaps: function(begin, end)
        {
            this.getRangeCollectionFor("laps").each(function(lap)
            {
                //if the lap is not either completely before or after the selected range, then it overlaps in some way and should be cut
                if(!(lap.get("end") < begin || lap.get("begin") > end ))
                {
                    lap.getState().set("isCut", true);
                }

            });
        },

        _resetDataParser: function()
        {
            this.graphData.resetExcludedRanges();
            this._dataParser.loadData(this.get("flatSamples"));
            this.trigger("loaded:flatSamples");
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

        _resetRangeDataForLaps: function()
        {
            if(this.rangeCollections.hasOwnProperty("laps"))
            {
                var lapsCollection = this.getRangeCollectionFor("laps");
                lapsCollection.reset(this._augmentRangeData(this.get("lapsStats"), "laps"));
            }
        },

        _resetStateForLaps: function()
        {
            if(this.rangeCollections.hasOwnProperty("laps"))
            {
                var lapsCollection = this.getRangeCollectionFor("laps");
                this._augmentRangeState(lapsCollection, "laps");
            }
        },

        _resetChannels: function()
        {
            this.set("channelCuts", null);
            this.set("disabledDataChannels", []);
            this.set("availableDataChannels", this.has("flatSamples") ? this.get("flatSamples").channelMask : []);
        },

        _triggerSensorDataChange: function()
        {
            this.trigger("changeSensorData", this);
        },

        // allows to group changes into a single set() call so we don't trigger expensive events multiple times
        _batchChanges: function(handler)
        {
            this._openBatchOfChanges();

            try {
                handler.call(this);
                this._applyBatchOfChanges();
                this._closeBatchOfChanges();
            }
            catch(e)
            {
                this._closeBatchOfChanges();
                throw e;
            }
        },

        _openBatchOfChanges: function()
        {
            if(!this._isInChangeBatch())
            {
                this._batchOfChanges = {};
            }
        },

        _isInChangeBatch: function()
        {
            return this._batchOfChanges ? true : false;
        },

        _closeBatchOfChanges: function()
        {
            this._batchOfChanges = null;
        },

        _applyBatchOfChanges: function()
        {
            if(this._batchOfChanges)
            {
                this.constructor.__super__.set.call(this, this._batchOfChanges);
            }
        },

        _checkForExpensiveChanges: function(keyToSet)
        {
            var potentiallyExpensiveChanges = ["flatSamples", "lapsStats", "originalLapsStats"];

            // whenever we set flatsamples on this model, if it already has a flatsamples,
            // the _.isEqual comparison in backbone can be extremely slow
            // assume that if we are setting flat samples, we want the change event,
            // so just set it to null for fast easy comparison
            _.each(potentiallyExpensiveChanges, function(expensiveChange)
            {
                if((keyToSet === expensiveChange || _.isObject(keyToSet) && keyToSet.hasOwnProperty(expensiveChange)) && this.attributes[expensiveChange] !== null)
                {
                    this.attributes[expensiveChange] = null;
                }
            }, this);

        },

        set: function(key, value, options)
        {
            if(this._isInChangeBatch())
            {
                this._batchOfChanges[key] = value;
            }
            else
            {
                this._checkForExpensiveChanges(key);
                return this.constructor.__super__.set.call(this, key, value, options);
            }
        },

        get: function(key)
        {
            if(this._isInChangeBatch() && this._batchOfChanges.hasOwnProperty(key))
            {
                return this._batchOfChanges[key];
            }
            else
            {
                return this.constructor.__super__.get.call(this, key);
            }
        }

    });

    return WorkoutDetailData;
});
