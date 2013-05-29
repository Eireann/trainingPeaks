define(
[
    "TP",
    "./expandoCommon",
    "hbs!templates/views/expando/lapsTemplate"
],
function (TP, expandoCommon, lapsTemplate)
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

        onRender: function()
        {
            this.watchForWorkoutTypeChange();
            this.watchForPeakChanges();
            this.watchForControllerResize();
        },

        events:
        {
            "change #peakType": "onSelectPeakType"
        },

        serializeData: function ()
        {

            this.getDefaultSelectOption();
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

            if ((totals && totals.length && totals[0].totalTime) || (laps && laps.length) || (peaks && peaks.length))
            {
                workoutData.hasLapsOrPeaks = true;
            }

            if (selectOptions && selectOptions.length)
            {
                workoutData.selectOptions = selectOptions;
            }

            return workoutData;
        },

        getTotalsData: function (detailData)
        {
            var totalData = detailData.totalStats ? detailData.totalStats : {};
            expandoCommon.calculateTotalAndMovingTime(totalData);
            return totalData;
        },

        getLapsData: function (detailData)
        {
            var lapsData = detailData.lapsStats ? detailData.lapsStats : [];
            _.each(lapsData, function (lapItem)
            {
                expandoCommon.calculateTotalAndMovingTime(lapItem);
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
            var visiblePeaks = this.getEnabledPeaks();
            var outputPeaks = [];
            var peaksData = detailData[metric] ? detailData[metric] : [];

            var units = this.getPeakUnitsLabel();
            _.each(peaksData, function (peakItem)
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
            if (this.shouldDisplayDistance())
            {
                return ["distance", "power", "heartrate", "speed", "pace", "cadence"];
            } else
            {
                return ["power", "heartrate", "speed", "pace", "cadence"];
            }
        },

        formatMethods: {
            pace: TP.utils.conversion.formatPace,
            speed: TP.utils.conversion.formatSpeed,
            distance: TP.utils.conversion.formatPace
        },

        onSelectPeakType: function ()
        {
            this.selectedPeakType = this.$("#peakType").val();
            this.render();
        },

        watchForControllerResize: function()
        {
            this.on("controller:resize", this.onControllerResize, this);
            this.on("close", function()
            {
                this.off("controller:resize", this.onControllerResize, this);
            }, this);
        },

        onControllerResize: function(containerHeight)
        {
            this.$el.parent().height(Math.round(containerHeight * 0.6));
        },

        getEnabledPeaks: function()
        {
            if (this.selectedPeakType === "distance")
            {
                return [400, 800, 1000, 1600, 1609, 5000, 8047, 10000, 15000, 16094, 21097, 30000, 42195, 50000, 100000];
            } else
            {
                return [1, 2, 5, 10, 12, 20, 30, 60, 90, 120, 300, 360, 600, 720, 1200, 1800, 3600, 5400, 7200, 10800];
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
            this.render();
        }

    });
});