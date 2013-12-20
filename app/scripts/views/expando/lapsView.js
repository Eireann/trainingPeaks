define(
[
    "underscore",
    "setImmediate",

    "TP",
    "utilities/units/labels",
    "models/workoutStatsForRange",
    "views/expando/lapView",

    "hbs!templates/views/expando/lapsTemplate"
],
function(
    _,
    setImmediate,
    TP,
    getUnitsLabel,
    WorkoutStatsForRange,
    LapView,
    lapsTemplate
)
{

    var LapsView = TP.CompositeView.extend(
    {

        className: "expandoLaps",

        itemView: LapView,
        itemViewContainer: ".rangesList ul",

        template:
        {
            type: "handlebars",
            template: lapsTemplate
        },

        events:
        {
            "click .uncheck": "_onUncheckClick",
            "change select.peakType": "_onPeakTypeChange"
        },

        initialize: function(options)
        {

            var self = this;

            if(!options.stateModel)
            {
                throw new Error("Laps view requires an expando state model");
            }


            this.collection = new TP.Collection([], { model: WorkoutStatsForRange });

            this.itemViewOptions = _.extend(this.itemViewOptions || {}, { stateModel: options.stateModel });
            this.stateModel = options.stateModel;

            // when a new temporary primary range is added to the state model, add it to our collection as a temporary lap
            this.listenTo(this.stateModel, "change:primaryRange", function(stateModel, range)
            {
                self.collection.remove(
                    self.collection.find(
                        function(model){return model.getState().get("temporary") ? true : false;}
                    )
                );

                if(range && range.getState().get("temporary"))
                {
                    self.collection.unshift(range);
                }
            });

            // when a model that was temporary changes to become a permanent lap, add it to the detaildata laps collection
            this.listenTo(this.collection, "state:change:temporary", function(model) {
                if(model.getState().get("isLap") && !model.getState().get("temporary"))
                {
                    self.model.get("detailData").getRangeCollectionFor("laps").unshift(model);
                }
            });

            this.listenTo(this.model.get("detailData"), "change:channelCuts", _.bind(this._enableOrDisable, this));
            this.listenTo(this.model.get("detailData"), "reset", _.bind(this._onDetailDataReset, this));
        },

        serializeData: function()
        {
            return {
                selectOptions: this._getSelectOptions(),
                hasLapsOrPeaks: true
            };
        },

        appendHtml: function(collectionView, itemView, index)
        {
            var model = collectionView.collection.at(index + 1);
            var prevView = model ? collectionView.children.findByModel(model) : null;
            if(prevView)
            {
                prevView.$el.before(itemView.$el);
            }
            else
            {
                LapsView.__super__.appendHtml.apply(collectionView, arguments);
            }
        },

        onRender: function()
        {
            this._enableOrDisable();
        },

        _onDetailDataReset: function()
        {
            this.stateModel.reset();
            this.render();
        },

        _enableOrDisable: function()
        {
            if(this.model.get("detailData").has("channelCuts"))
            {
                this.$el.addClass("disabled");
            }
            else
            {
                this.$el.removeClass("disabled");
            }
        },

        onShow: function()
        {
            this._updateCollection();
        },

        _updateCollection: function()
        {
            var detailData = this.model.get("detailData");
            var lapsCollection = detailData.getRangeCollectionFor("laps");
            var lapRanges = lapsCollection.models;

            this.listenTo(lapsCollection, "reset", _.bind(this._updateCollection, this));

            var ranges = lapRanges.slice();

            if(detailData.get("totalStats"))
            {
                var totalRange = this._asRangeModel(detailData.get("totalStats"), { hasLoaded: true, name: "Entire Workout" });
                totalRange.getState().set("isTotal", true);
                ranges.unshift(totalRange);
            }

            var peakType = this.$("select.peakType").val();
            ranges = ranges.concat(this._getPeaksData(peakType));

            this.collection.reset(ranges);
        },

        _asRangeModel: function(attrs, extra)
        {
            attrs = _.extend({}, attrs, extra);
            attrs.workoutId = this.model.id;
            var range = new WorkoutStatsForRange(attrs);
            return range;
        },

        _onUncheckClick: function(e)
        {
            this.stateModel.get("ranges").set([]);
        },

        templatePeakTypeNames:
        {
            distance: "Peak Distance",
            power: "Peak Power",
            heartrate: "Peak Heart Rate",
            speed: "Peak Speed",
            pace: "Peak Pace",
            cadence: "Peak Cadence"
        },

        modelPeakKeys:
        {
            distance: "peakSpeedsByDistance",
            power: "peakPowers",
            heartrate: "peakHeartRates",
            speed: "peakSpeeds",
            pace: "peakSpeeds",
            cadence: "peakCadences"
        },

        dataChannelKeys:
        {
            distance: "Speed",
            power: "Power",
            heartrate: "HeartRate",
            speed: "Speed",
            pace: "Speed",
            cadence: "Cadence"
        },

        _getSelectOptions: function()
        {

            if(!theMarsApp.featureAuthorizer.canAccessFeature(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges
            ))
            {
                return [];
            }
            var detailData = this.model.get("detailData").toJSON();

            var selectOptions = [];
            _.each(this._getSelectablePeakTypes(), function(peakKey, peakName)
            {
                if(detailData[peakKey] && detailData[peakKey].length)
                {
                    selectOptions.push({
                        value: peakName,
                        label: this.templatePeakTypeNames[peakName],
                    });
                }
            }, this);

            return selectOptions;

        },

        _onPeakTypeChange: function()
        {
            this._updateCollection();
        },

        _getPeaksData: function(peakType)
        {
            if(!theMarsApp.featureAuthorizer.canAccessFeature(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges
                )
            ){
                return [];
            }

            if(!peakType)
            {
                return [];
            }

            var ranges = this.model.get("detailData").getRangeCollectionFor(peakType).models;

            // filter by enabled intervals
            var enabledPeakIntervals = this._getEnabledPeaks(peakType);
            ranges = _.filter(ranges, function(range)
            {
                return _.contains(enabledPeakIntervals, range.get("interval"));
            });

            _.each(ranges, function(range)
            {
                var formattedValue = this._formatPeakValue(peakType, range.get("value"), this.model.get("workoutTypeValueId"));
                var formattedUnits = this._formatPeakUnits(peakType, this.model.get("workoutTypeValueId"));
                range.set("formattedValue", formattedValue);
                range.set("formattedUnits", formattedUnits);
            }, this);

            return ranges;
        },

        _formatPeakValue: function(peakType, peakValue, workoutTypeId)
        {
            var formatType = peakType === "distance" ? "pace" : peakType;
            return TP.utils.conversion.formatUnitsValue(formatType, peakValue, { workoutTypeId: workoutTypeId });
        },

        _formatPeakUnits: function(peakType, workoutTypeId)
        {
            var formatType = peakType === "distance" ? "pace" : peakType;
            return getUnitsLabel(formatType, workoutTypeId);
        },

        _getEnabledPeaks: function(selectedPeakType)
        {
            if (selectedPeakType === "distance")
            {
                return [400, 800, 1000, 1600, 1609, 5000, 8047, 10000, 15000, 16094, 21097, 30000, 42195, 50000, 100000];
            } else
            {
                return [2, 5, 10, 12, 20, 30, 60, 90, 120, 300, 360, 600, 720, 1200, 1800, 3600, 5400, 7200, 10800];
            }
        },

        _getSelectablePeakTypes: function()
        {

            var peakTypes = _.clone(this.modelPeakKeys);

            if (!this._shouldDisplayDistance())
            {
                delete peakTypes.distance;
            }

            if (!this._shouldDisplayPace())
            {
                delete peakTypes.pace;
            }

            if (!this._shouldDisplaySpeed())
            {
                delete peakTypes.speed;
            }

            this._filterPeaksByAvailableChannels(peakTypes);
            return peakTypes;
        },

        _filterPeaksByAvailableChannels: function(peakTypes)
        {
            var availableDataChannels = this.model.get("detailData").get("availableDataChannels");
            _.each(peakTypes, function(data, key) {
                if(!_.contains(availableDataChannels, this.dataChannelKeys[key]))
                {
                    delete peakTypes[key];
                }
            }, this);
        },

        _shouldDisplayDistance: function()
        {
            var workoutTypeId = this.model.get("workoutTypeValueId");
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Walk"))
            {
                return true;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Run"))
            {
                return true;
            }
            return false;
        },

        _shouldDisplayPace: function()
        {
            var workoutTypeId = this.model.get("workoutTypeValueId");
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Walk"))
            {
                return true;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Run"))
            {
                return true;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Swim"))
            {
                return true;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Other"))
            {
                return true;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Rowing"))
            {
                return true;
            }
            return false;
        },

        _shouldDisplaySpeed: function()
        {
            var workoutTypeId = this.model.get("workoutTypeValueId");
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Walk"))
            {
                return false;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Run"))
            {
                return false;
            }
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Swim"))
            {
                return false;
            }
            return true;
        }
    });

    return LapsView;

});
