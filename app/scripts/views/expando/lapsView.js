define(
[
    "setImmediate",
    "jqueryui/widget",
    "jquerySelectBox",
    "TP",
    "utilities/workout/formatLapData",
    "utilities/workout/formatPeakTime",
    "models/workoutStatsForRange",
    "hbs!templates/views/expando/lapTemplate",
    "hbs!templates/views/expando/lapsTemplate"
],
function(
    setImmediate,
    jqueryUiWidget,
    jquerySelectBox,
    TP,
    formatLapData,
    formatPeakTime,
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

            return _.map(_.sortBy(peaksData, "interval"), function(peakItem)
            {

                var range = _.clone(peakItem);
                range.name = "Peak " + formatPeakTime(peakItem.interval);
                range.name += " (" + TP.utils.conversion.formatUnitsValue(peakType, peakItem.value, { workoutTypeId: this.model, withLabel: true }) + ")";

                return range;

            }, this);

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
