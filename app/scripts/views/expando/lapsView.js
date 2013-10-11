define(
[
    "setImmediate",
    "jqueryui/widget",
    "jquerySelectBox",
    "TP",
    "utilities/workout/formatLapData",
    "utilities/workout/formatPeakTime",
    "models/workoutStatsForRange",
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
    lapsTemplate)
{

    var LapView = TP.ItemView.extend(
    {

        tagName: "li",
        className: "lap",

        template: _.template('<input type="checkbox"> <span><%= name %></span>'),

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
            }
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
            _.each(this.modelPeakKeys, function(peakKey, peakName)
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

                console.log(peakItem);
                var range = _.clone(peakItem);
                range.name = "Peak " + formatPeakTime(peakItem.interval);

                return range;

            });

        }

    });

    return LapsView;

    return TP.ItemView.extend(
    {

        template:
        {
            type: "handlebars",
            template: lapsTemplate
        },

        initialEvents: function()
        {
            this.model.off("change", this.render);
        },

        initialize: function(options)
        {
            this.stateModel = options.stateModel;
            this.initializeCheckboxes(true);
            this.once("render", this.onInitialRender, this);
        },

        onInitialRender: function()
        {
            this.watchForWorkoutTypeChange();
            this.watchForDataChanges();
            this.watchForControllerEvents();
        },

        onRender: function()
        {
            var self = this;

            setImmediate(function()
            {
                self.styleSelectBox();
            });
        },

        styleSelectBox: function()
        {
            this.$("#peakType").selectBoxIt(
            {
                dynamicPositioning: false
            });
        },

        events:
        {
            "change #peakType": "onSelectPeakType",
            "click .lap span": "onLapsClicked",
            "click .totals span": "onEntireWorkoutClicked",
            "click .peaks span": "onPeaksClicked",
            "click .lap .checkbox": "onLapsCheckboxClicked",
            "click .totals .checkbox": "onEntireWorkoutCheckboxClicked",
            "click .peaks .checkbox": "onPeaksCheckboxClicked",
            "click #uncheck": "onUncheckAll"
        },

        serializeData: function()
        {
            this.getDefaultSelectOption();
            this.initializeCheckboxes();

            var detailData = this.model.get("detailData").toJSON();

            var totals = this.getTotalsData(detailData);
            var laps = this.getLapsData(detailData);
            var peaks = this.getPeaksData(detailData);

            var selectOptions = this.getSelectOptions(detailData);

            var workoutData = this.model.toJSON();
            workoutData.rangeTotals = totals;
            workoutData.rangeLaps = laps;
            //TODO: get correct peaks on drop down select
            workoutData.rangePeaks = peaks;

            if ((totals && totals.totalTime) || (laps && laps.length) || (peaks && peaks.length))
            {
                workoutData.hasLapsOrPeaks = true;
            }

            if (selectOptions && selectOptions.length)
            {
                workoutData.selectOptions = selectOptions;
            }

            return workoutData;
        },

        getTotalsData: function(detailData)
        {
            var totalData = detailData.totalStats ? detailData.totalStats : {};
            formatLapData.calculateTotalAndMovingTime(totalData);

            totalData.checked = this.checkboxStates.entireWorkout;
            return totalData;
        },

        getLapsData: function(detailData)
        {
            var lapsData = detailData.lapsStats ? detailData.lapsStats : [];
            _.each(lapsData, function (lapItem, index)
            {
                formatLapData.calculateTotalAndMovingTime(lapItem);
                lapItem.checked = this.checkboxStates.laps[index];
            }, this);
            return lapsData;
        },

        getPeaksData: function(detailData)
        {
            if(!theMarsApp.featureAuthorizer.canAccessFeature(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges
                )
            ){
                return [];
            }

            if (!this.selectedPeakType)
                return [];

            var metric = this.modelPeakKeys[this.selectedPeakType];
            var visiblePeaks = this.getEnabledPeaks(this.selectedPeakType);
            var outputPeaks = [];
            var peaksData = detailData[metric] ? detailData[metric] : [];

            var units = this.getPeakUnitsLabel();
            _.each(peaksData, function(peakItem)
            {
                if (_.contains(visiblePeaks, peakItem.interval))
                {
                    outputPeaks[peakItem.interval] = peakItem;
                    peakItem.units = units;
                    if (this.formatMethods[this.selectedPeakType])
                    {
                        peakItem.formattedValue = TP.utils.conversion[this.formatMethods[this.selectedPeakType]](peakItem.value, { workoutTypeValueId: this.model.get("workoutTypeValueId") });
                    } else
                    {
                        peakItem.formattedValue = peakItem.value;
                    }
                    if (this.selectedPeakType === "distance")
                    {
                        peakItem.isDistance = true;
                        peakItem.isTime = false;
                    } else
                    {
                        peakItem.isDistance = false;
                        peakItem.isTime = true;
                    }

                    peakItem.checked = this.checkboxStates.peaks[peakItem.interval];
                }
            }, this);
            return _.compact(outputPeaks);
        },

        getSelectOptions: function (detailData)
        {
            if(!theMarsApp.featureAuthorizer.canAccessFeature(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges
                )
            ){
                return [];
            }

            var selectOptions = [];
            _.each(this.getPeakTypes(), function(peakName)
            {
                var modelKey = this.modelPeakKeys[peakName];
                if (detailData[modelKey] && detailData[modelKey].length)
                {
                    selectOptions.push({
                        value: peakName,
                        label: this.templatePeakTypeNames[peakName],
                        selected: peakName === this.selectedPeakType
                    });
                }
            }, this);

            return selectOptions;
        },

        getDefaultSelectOption: function()
        {
            if (this.selectedPeakType)
                return;

            var detailData = this.model.get("detailData");

            this.selectedPeakType = _.find(this.getPeakTypes(), function(peakName)
            {
                var modelKey = this.modelPeakKeys[peakName];
                if (detailData.has(modelKey) && detailData.get(modelKey).length)
                {
                    return true;
                }
                else
                {
                    return false;
                }

            }, this);

        },

        getPeakUnitsLabel: function()
        {
            if (this.selectedPeakType === "distance")
            {
                return TP.utils.units.getUnitsLabel("pace", this.model.get("workoutTypeValueId"));
            } else
            {
                return TP.utils.units.getUnitsLabel(this.selectedPeakType, this.model.get("workoutTypeValueId"));
            }
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

        getPeakTypes: function()
        {
            var allKeys = ["distance", "pace", "power", "speed", "heartrate", "cadence"];

            if (!this.shouldDisplayDistance())
                allKeys = _.without(allKeys, "distance");

            if (!this.shouldDisplayPace())
                allKeys = _.without(allKeys, "pace");

            if (!this.shouldDisplaySpeed())
                allKeys = _.without(allKeys, "speed");

            return allKeys;
        },

        formatMethods:
        {
            pace: "formatPace",
            speed: "formatSpeed",
            distance: "formatPace"
        },

        onUncheckAll: function()
        {
            // render right away so our select box styles nicely instead of waiting for charts to paint
            this.initializeCheckboxes(true);
            this.render();
            this.trigger("unselectall");
        },

        onUnSelectAll: function()
        {
            this.initializeCheckboxes(true);
            this.render();
        },

        onSelectPeakType: function ()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "peakTypeSelected", "eventLabel": "" });
            
            this.changePeakType(this.$("#peakType").val());
        },

        changePeakType: function(newPeakType)
        {
            // unselect other peaks
            this.unselectAllCheckedPeaks(this.selectedPeakType);

            // render, and reselect same peak time ranges
            this.selectedPeakType = newPeakType;
            this.render();
            this.reselectAllCheckedPeaks(this.selectedPeakType);

            // display totals
            this.stateModel.set("statsRange", this.getEntireWorkoutRange());
        },

        unselectAllCheckedPeaks: function(peakType)
        {
            _.each(this.checkboxStates.peaks, function(value, interval)
            {
                if (value)
                {
                    var options = {
                        removeFromSelection: true,
                        updateCheckboxes: false
                    };
                    this.selectPeak(peakType, interval, options);
                }

            }, this);
        },

        reselectAllCheckedPeaks: function(peakType)
        {
            _.each(this.checkboxStates.peaks, function(value, interval)
            {
                if (value)
                {
                    var options = {
                        addToSelection: true,
                        updateCheckboxes: false
                    };
                    this.selectPeak(peakType, interval, options);
                }

            }, this);
        },

        selectPeak: function(peakType, peakInterval, options)
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "peakSelected", "eventLabel": "" });

            var peakDataItem = this.findPeak(peakType, peakInterval);

            if (options.updateCheckboxes)
            {
                this.checkboxStates.peaks[peakInterval] = options.addToSelection ? true : false;
            }

            if (peakDataItem)
            {
                peakDataItem.workoutId = this.model.id;
                peakDataItem.name = "Peak " + this.formatPeakName(peakInterval);
                var statsForRange = this.getWorkoutStatsForRange(peakDataItem);
                options.dataType = peakType;

                if(options.removeFromSelection)
                {
                    this.stateModel.get("ranges").remove(statsForRange);
                }
                else if(options.addToSelection)
                {
                    this.stateModel.get("ranges").add(statsForRange);
                }
                else if(options.setStatsRange)
                {
                    this.stateModel.set("statsRange", statsForRange);
                }
            }
        },

        findPeak: function(peakType, peakInterval)
        {
            // string from dom, need int in model
            peakInterval = Number(peakInterval);

            var detailData = this.model.get("detailData").toJSON();
            var peakDataSet = detailData[this.modelPeakKeys[peakType]];

            return _.find(peakDataSet, function(item)
            {
                return item.interval === peakInterval;
            });
        },

        onLapsClicked: function(e)
        {
            var self = this;
            theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges,
                function()
                {
                    self.handleLapsClicked(e);
                }
            );
        },

        handleLapsClicked: function(e)
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "lapClicked", "eventLabel": "" });

            var target = $(e.target);
            var li = target.closest("li");
            var lapIndex = li.data("lapindex");
            var detailData = this.model.get("detailData").toJSON();
            var lapData = detailData.lapsStats[lapIndex];
            lapData.workoutId = this.model.id;
            var statsForRange = this.getWorkoutStatsForRange(lapData);
            statsForRange.hasLoaded = true;

            this.stateModel.set("statsRange", statsForRange);

            this.highlightListItem(li);
        },

        onLapsCheckboxClicked: function(e)
        {
            var self = this;
            theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges,
                function()
                {
                    self.handleLapsCheckboxClicked(e);
                }
            );
        },

        handleLapsCheckboxClicked: function(e)
        {
            var target = $(e.target);
            var li = target.closest("li");
            var lapIndex = li.data("lapindex");
            var detailData = this.model.get("detailData").toJSON();
            var lapData = detailData.lapsStats[lapIndex];
            lapData.workoutId = this.model.id;
            var statsForRange = this.getWorkoutStatsForRange(lapData);
            statsForRange.hasLoaded = true;

            if (target.is(":checked"))
            {
                this.stateModel.get("ranges").add(statsForRange);
                this.checkboxStates.laps[lapIndex] = true;
            } else {
                this.stateModel.get("ranges").remove(statsForRange);
                this.checkboxStates.laps[lapIndex] = false;
            }
        },

        onEntireWorkoutClicked: function(e)
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "entireWorkoutClicked", "eventLabel": "" });

            var target = $(e.target);
            var li = target.closest("li");
            var options = { setStatsRange: true };
            this.stateModel.set("statsRange", this.getEntireWorkoutRange());
            this.highlightListItem(li);
        },

        onEntireWorkoutCheckboxClicked: function(e)
        {
            var self = this;
            theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges,
                function()
                {
                    self.handleEntireWorkoutCheckboxClicked(e);
                }
            );
        },

        handleEntireWorkoutCheckboxClicked: function(e)
        {
            var target = $(e.target);

            var range = this.getEntireWorkoutRange();

            if(target.is(":checked"))
            {
                this.stateModel.get("ranges").add(range);
                this.checkboxStates.entireWorkout = true;
            } else
            {
                this.stateModel.get("ranges").remove(range);
                this.checkboxStates.entireWorkout = false;
            }
        },

        getEntireWorkoutRange: function()
        {
            var detailData = this.model.get("detailData").toJSON();
            var entireWorkoutData = detailData.totalStats;
            entireWorkoutData.workoutId = this.model.id;
            entireWorkoutData.name = "Entire Workout";
            var statsForRange = this.getWorkoutStatsForRange(entireWorkoutData);
            statsForRange.hasLoaded = true;

            return statsForRange;
        },

        onPeaksClicked: function(e)
        {
            var self = this;
            theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                theMarsApp.featureAuthorizer.features.ViewGraphRanges,
                function()
                {
                    self.handlePeaksClicked(e);
                }
            );
        },

        handlePeaksClicked: function(e)
        {
            var target = $(e.target);
            var li = target.closest("li");
            var peakInterval = li.data("peakinterval");

            var options = { setStatsRange: true };
            this.selectPeak(this.selectedPeakType, peakInterval, options);
            this.highlightListItem(li);

        },
        
        onPeaksCheckboxClicked: function(e)
        {
            var target = $(e.target);
            var li = target.closest("li");
            var peakInterval = li.data("peakinterval");

            var options = {};

            if (target.is(":checked"))
            {
                options = {
                    updateCheckboxes: true,
                    addToSelection: true
                };
                this.selectPeak(this.selectedPeakType, peakInterval, options);
            } else
            {
                options = {
                    updateCheckboxes: true,
                    removeFromSelection: true
                };
                this.selectPeak(this.selectedPeakType, peakInterval, options);
            }

        },

        highlightListItem: function(target)
        {
            this.$(".rangesList li").removeClass("highlight");
            target.addClass("highlight");
        },

        watchForControllerEvents: function()
        {
            this.listenTo(this.stateModel.get("ranges"), "reset", _.bind(this.onUnSelectAll, this));
        },

        getEnabledPeaks: function(selectedPeakType)
        {
            if (selectedPeakType === "distance")
            {
                return [400, 800, 1000, 1600, 1609, 5000, 8047, 10000, 15000, 16094, 21097, 30000, 42195, 50000, 100000];
            } else
            {
                return [2, 5, 10, 12, 20, 30, 60, 90, 120, 300, 360, 600, 720, 1200, 1800, 3600, 5400, 7200, 10800];
            }
        },

        shouldDisplayDistance: function()
        {
            var workoutTypeId = this.model.get("workoutTypeValueId");
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Walk"))
                return true;
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Run"))
                return true;
            return false;
        },

        shouldDisplayPace: function()
        {
            var workoutTypeId = this.model.get("workoutTypeValueId");
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Walk"))
                return true;
                return true;
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Swim"))
                return true;
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Other"))
                return true;
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Rowing"))
                return true;
            return false;
        },

        shouldDisplaySpeed: function()
        {
            var workoutTypeId = this.model.get("workoutTypeValueId");
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Walk"))
                return false;
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Run"))
                return false;
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Swim"))
                return false;
            return true;
        },

        watchForWorkoutTypeChange: function()
        {
            this.model.on("change:workoutTypeValueId", this.onWorkoutTypeChange, this);
            this.on("close", function()
            {
                this.model.off("change:workoutTypeValueId", this.onWorkoutTypeChange, this);
            }, this);
        },

        onWorkoutTypeChange: function()
        {
            this.selectedPeakType = null;
            this.render();
        },

        watchForDataChanges: function()
        {
            this.model.get("detailData").on("change", this.reset, this);
            this.on("close", this.stopWatchingDataChanges, this);
        },

        stopWatchingDataChanges: function()
        {
            this.model.get("detailData").off("change", this.reset, this);
        },

        reset: function()
        {
            this.cachedWorkoutStats = {};
            this.selectedPeakType = null;
            this.initializeCheckboxes(true);
            this.render();
            this.stateModel.set("statsRange", this.getEntireWorkoutRange());
        },

        formatPeakName: function(interval)
        {
            if (this.selectedPeakType === "distance")
            {
                return TP.utils.workout.formatPeakDistance(interval); 
            } else {
                return TP.utils.workout.formatPeakTime(interval);                   
            }
        },

        initializeCheckboxes: function(reset)
        {
            if(this.checkboxStates && !reset)
            {
                return;
            }

            this.checkboxStates = {
                entireWorkout: false,
                laps: [],
                peaks: {}
            };

            if (this.model.has("detailData") && this.model.get("detailData").has("lapsStats"))
            {
                var laps = this.model.get("detailData").get("lapsStats");
                _.each(laps, function(lap, index)
                {
                    this.checkboxStates.laps[index] = false;
                }, this);
            }

            var distancePeaks = this.getEnabledPeaks("distance");
            var otherPeaks = this.getEnabledPeaks();
            _.each(distancePeaks, function(peakInterval)
            {
                this.checkboxStates.peaks[peakInterval] = false;
            }, this);
            _.each(otherPeaks, function(peakInterval)
            {
                this.checkboxStates.peaks[peakInterval] = false;
            }, this);
        },

        getWorkoutStatsForRange: function(rangeData)
        {

            if(!this.cachedWorkoutStats)
            {
                this.cachedWorkoutStats = {};
            }

            // combination of name + msOffset start + msOffset end, to create a unique key
            // name alone doesn't work, because peak 60 seconds cadence vs peak 60 seconds heart rate would have different start/end offsets
            // start/end offset alone doesn't work, because if you're moving fast enough, 1 mile (1609 meters) will be the same as 1600 meters
            var rangeKey = rangeData.name + ":" + rangeData.begin + ":" + rangeData.end;

            if(this.cachedWorkoutStats.hasOwnProperty(rangeKey))
            {
                return this.cachedWorkoutStats[rangeKey];
            }

            var stats = new WorkoutStatsForRange(rangeData);
            this.cachedWorkoutStats[rangeKey] = stats;
            return stats;
        }

    });
});
