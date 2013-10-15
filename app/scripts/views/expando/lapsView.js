define(
[
    "underscore",
    "setImmediate",
    "jqueryui/widget",
    "jquerySelectBox",
    "TP",
    "utilities/workout/formatLapData",
    "utilities/workout/formatPeakTime",
    "utilities/workout/formatPeakDistance",
    "models/workoutStatsForRange",
    "hbs!templates/views/expando/lapTemplate",
    "hbs!templates/views/expando/lapsTemplate"
],
function(
    _,
    setImmediate,
    jqueryUiWidget,
    jquerySelectBox,
    TP,
    formatLapData,
    formatPeakTime,
    formatPeakDistance,
    WorkoutStatsForRange,
    lapTemplate,
    lapsTemplate
)
{

    var LapView = TP.ItemView.extend(
    {

        tagName: "li",
        className: "lap",

        template:
        {
            type: "handlebars",
            template: lapTemplate,
        },

        modelEvents:
        {
            "change:isFocused": "_onFocusedChange",
            "change:isSelected": "_onSelectedChange"
        },

        events:
        {
            "click span": "_onClick",
            "change input": "_onInputChange"
        },

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
        },

        onRender: function()
        {
            this._onFocusedChange();
            this._onSelectedChange();
        },

        _onFocusedChange: function()
        {
            this.$el.toggleClass("highlight", !!this.model.get("isFocused"));
        },

        _onSelectedChange: function()
        {
            this.$("input").attr("checked", !!this.model.get("isSelected"));
        },

        _onClick: function(e)
        {
            this.stateModel.set("statsRange", this.model);
        },

        _onInputChange: function(e)
        {
            if(this.$("input").is(":checked"))
            {
                this.stateModel.get("ranges").add(this.model);
            }
            else
            {
                this.stateModel.get("ranges").remove(this.model);
            }
        }

    });

    var LapsView = TP.CompositeView.extend(
    {

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

            this.collection = new TP.Collection({ model: WorkoutStatsForRange });
            this.itemViewOptions = _.extend(this.itemViewOptions || {}, { stateModel: options.stateModel });
            this.stateModel = options.stateModel;


            this.listenTo(this.stateModel.get("ranges"), "add", function(range)
            {
                if(range.get("temporary"))
                {
                    self.collection.unshift(range);
                }
            });

            this.listenTo(this.stateModel.get("ranges"), "remove", function(range)
            {
                if(range.get("temporary"))
                {
                    self.collection.remove(range);
                }
            });

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
            setImmediate(function()
            {
                this.$("select").selectBoxIt();
            });
        },

        onShow: function()
        {
            this._updateCollection();
        },

        _updateCollection: function()
        {
            var detailData = this.model.get("detailData").toJSON();
            var lapRanges = detailData.lapsStats ? detailData.lapsStats : [];
            _.each(lapRanges, formatLapData.calculateTotalAndMovingTime);

            var totalRange = detailData.totalStats ? detailData.totalStats : null;
            formatLapData.calculateTotalAndMovingTime(totalRange);

            var ranges = _.map(_.compact([].concat(lapRanges, [totalRange])), _.bind(this._asRangeModel, this, true));

            var peakType = this.$("select.peakType").val();
            var peakRanges = peakType ? this._getPeaksData(peakType) : [];

            ranges = ranges.concat(_.map(peakRanges, _.bind(this._asRangeModel, this, false)));

            this.collection.set(ranges);
        },

        _asRangeModel: function(hasLoaded, attrs)
        {
            attrs.workoutId = this.model.id;
            var range = new WorkoutStatsForRange(attrs);
            range.hasLoaded = hasLoaded;
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

            var detailData = this.model.get("detailData").toJSON();

            var metric = this.modelPeakKeys[peakType];
            var peaksData = detailData[metric] ? detailData[metric] : [];

            // sort
            peaksData = _.sortBy(peaksData, "interval");

            // remove duplicates
            peaksData = _.uniq(peaksData, true, function(peakItem)
            {
                return peakItem.interval;
            });

            // filter by enabled intervals
            var enabledPeakIntervals = this._getEnabledPeaks(peakType);
            peaksData = _.filter(peaksData, function(peakItem)
            {
                return _.contains(enabledPeakIntervals, peakItem.interval);
            });

            // configure for view
            return _.map(peaksData, function(peakItem)
            {

                var range = _.clone(peakItem);
                range.name = "Peak " + this._formatPeakName(peakType, peakItem.interval);
                range.name += " (" + this._formatPeakValue(peakType, peakItem.value, this.model.get("workoutTypeValueId")) + ")";

                return range;

            }, this);

        },

        _formatPeakValue: function(peakType, peakValue, workoutTypeId)
        {
            var formatType = peakType === "distance" ? "pace" : peakType;
            return TP.utils.conversion.formatUnitsValue(formatType, peakValue, { workoutTypeId: workoutTypeId, withLabel: true });
        },

        _formatPeakName: function(peakType, interval)
        {
            if(peakType === "distance")
            {
                return formatPeakDistance(interval);
            }
            else
            {
                return formatPeakTime(interval);
            }
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

            return peakTypes;
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
