define(
[
    "TP",
    "./expandoCommon",
    "models/workoutStatsForRange",
    "hbs!templates/views/expando/lapsTemplate"
],
function(TP, expandoCommon, WorkoutStatsForRange, lapsTemplate)
{
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

        initialize: function()
        {
            this.initializeCheckboxes(true);
        },

        onRender: function()
        {
            this.watchForWorkoutTypeChange();
            this.watchForPeakChanges();
            this.watchForControllerEvents();
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
            expandoCommon.calculateTotalAndMovingTime(totalData);

            totalData.checked = this.checkboxStates.entireWorkout;
            return totalData;
        },

        getLapsData: function(detailData)
        {
            var lapsData = detailData.lapsStats ? detailData.lapsStats : [];
            _.each(lapsData, function (lapItem, index)
            {
                expandoCommon.calculateTotalAndMovingTime(lapItem);
                lapItem.checked = this.checkboxStates.laps[index];
            }, this);
            return lapsData;
        },

        getPeaksData: function (detailData)
        {

            if (!this.selectedPeakType)
            {
                return [];
            }

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
                        peakItem.formattedValue = this.formatMethods[this.selectedPeakType](peakItem.value);
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

        templatePeakTypeNames: {
            distance: "Peak Distance",
            power: "Peak Power",
            heartrate: "Peak Heart Rate",
            speed: "Peak Speed",
            pace: "Peak Pace",
            cadence: "Peak Cadence"
        },

        modelPeakKeys: {
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

        formatMethods: {
            pace: TP.utils.conversion.formatPace,
            speed: TP.utils.conversion.formatSpeed,
            distance: TP.utils.conversion.formatPace
        },

        onUncheckAll: function()
        {
            this.trigger("unselectall");
        },

        onUnSelectAll: function()
        {
            this.initializeCheckboxes(true);
            this.render();
        },

        onSelectPeakType: function()
        {
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
            this.selectEntireWorkout();
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
                this.trigger("rangeselected", statsForRange, options, this);
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
            var target = $(e.target);
            var li = target.closest("li");
            var lapIndex = li.data("lapindex");
            var detailData = this.model.get("detailData").toJSON();
            var lapData = detailData.lapsStats[lapIndex];
            lapData.workoutId = this.model.id;
            var statsForRange = this.getWorkoutStatsForRange(lapData);
            statsForRange.hasLoaded = true;

            var options = {};

            if (target.is("input[type=checkbox]"))
            {
                if (target.is(":checked"))
                {
                    options.addToSelection = true;
                    this.checkboxStates.laps[lapIndex] = true;
                } else {
                    options.removeFromSelection = true;
                    this.checkboxStates.laps[lapIndex] = false;
                }
            }

            this.trigger("rangeselected", statsForRange, options, this);
            this.highlightListItem(li);
        },

        onLapsCheckboxClicked: function(e)
        {
            var target = $(e.target);
            var li = target.closest("li");
            var lapIndex = li.data("lapindex");
            var detailData = this.model.get("detailData").toJSON();
            var lapData = detailData.lapsStats[lapIndex];
            lapData.workoutId = this.model.id;
            var statsForRange = this.getWorkoutStatsForRange(lapData);
            statsForRange.hasLoaded = true;

            var options = {};

            if (target.is(":checked"))
            {
                options.addToSelection = true;
                this.checkboxStates.laps[lapIndex] = true;
            } else {
                options.removeFromSelection = true;
                this.checkboxStates.laps[lapIndex] = false;
            }

            this.trigger("rangeselected", statsForRange, options, this);
        },

        onEntireWorkoutClicked: function(e)
        {
            var target = $(e.target);
            var li = target.closest("li");
            var options = {};
            this.selectEntireWorkout(options);
            this.highlightListItem(li);
        },

        onEntireWorkoutCheckboxClicked: function(e)
        {
            var target = $(e.target);

            var options = {};

            if(target.is(":checked"))
            {
                options.addToSelection = true;
                this.checkboxStates.entireWorkout = true;
            } else
            {
                options.removeFromSelection = true;
                this.checkboxStates.entireWorkout = false;
            }

            this.selectEntireWorkout(options);
        },

        selectEntireWorkout: function(options)
        {
            var detailData = this.model.get("detailData").toJSON();
            var entireWorkoutData = detailData.totalStats;
            entireWorkoutData.workoutId = this.model.id;
            entireWorkoutData.name = "Entire Workout";
            var statsForRange = this.getWorkoutStatsForRange(entireWorkoutData);
            statsForRange.hasLoaded = true;

            this.trigger("rangeselected", statsForRange, options, this);

        },

        onPeaksClicked: function(e)
        {
            var target = $(e.target);
            var li = target.closest("li");
            var peakInterval = li.data("peakinterval");

            var options = {};

            this.selectPeak(this.selectedPeakType, peakInterval, options);
            this.highlightListItem(li);
        },
        
        onPeaksCheckboxClicked: function(e)
        {
            var target = $(e.target);
            var li = target.closest("li");
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
            this.on("controller:resize", this.setViewHeight, this);
            this.on("controller:unselectall", this.onUnSelectAll, this);
            this.on("close", function()
            {
                this.off("controller:resize", this.setViewHeight, this);
                this.off("controller:unselectall", this.onUnSelectAll, this);
            }, this);
        },

        setViewHeight: function(containerHeight)
        {
            // assumes that stats view resizes before laps view, because of their ordering in the expandoController
            //this.$el.parent().css("max-height", containerHeight / 2);
            this.$el.parent().height(containerHeight - $("#expandoStatsRegion").outerHeight());
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
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Run"))
                return true;
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Swim"))
                return true;
            if (workoutTypeId === TP.utils.workout.types.getIdByName("Other"))
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

        watchForPeakChanges: function()
        {
            var statsToWatch = ["lapsStats", "peakSpeedsByDistance", "peakPowers", "peakHeartRates", "peakSpeeds", "peakCadences"];
            var detailDataModel = this.model.get("detailData");

            _.each(statsToWatch, function(stat)
            {
                detailDataModel.on("change:" + stat, this.onPeaksChange, this);
            }, this);

            this.on("close", this.stopWatchingPeakChanges, this);

        },

        stopWatchingPeakChanges: function()
        {
            var statsToWatch = ["lapsStats", "peakSpeedsByDistance", "peakPowers", "peakHeartRates", "peakSpeeds", "peakCadences"];
            var detailDataModel = this.model.get("detailData");

            _.each(statsToWatch, function(stat)
            {
                detailDataModel.off("change:" + stat, this.onPeaksChange, this);
            }, this);
        },

        onPeaksChange: function()
        {
            this.selectedPeakType = null;
            this.initializeCheckboxes(true);
            this.render();
            this.selectEntireWorkout();
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