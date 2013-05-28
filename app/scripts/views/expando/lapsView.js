define(
[
    "TP",
    "./expandoCommon",
    "models/workoutStatsForRange",
    "hbs!templates/views/expando/lapsTemplate"
],
function (TP, expandoCommon, WorkoutStatsForRange, lapsTemplate)
{
    return TP.ItemView.extend(
    {

        template:
        {
            type: "handlebars",
            template: lapsTemplate
        },

        initialEvents: function ()
        {
            this.model.off("change", this.render);
        },

        events:
        {
            "change #peakType": "onSelectPeakType",
            "click .lap": "onLapsClicked",
            "click .totals": "onEntireWorkoutClicked",
            "click .peaks": "c"
            
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

            workoutData.selectOptions = selectOptions;

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
            var displayPeaks = [2, 5, 10];
            var outputPeaks = [];
            var peaksData = detailData[metric] ? detailData[metric] : [];
            var units = TP.utils.units.getUnitsLabel(this.selectedPeakType, this.model.get("workoutTypeValueId"));
            _.each(peaksData, function (peakItem)
            {
                if (_.contains(displayPeaks, peakItem.interval))
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
                }
            }, this);
            return _.compact(outputPeaks);
        },

        getSelectOptions: function (detailData)
        {
            var selectOptions = [];
            _.each(_.keys(this.modelPeakKeys), function (peakName)
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

        getDefaultSelectOption: function ()
        {
            if (this.selectedPeakType)
                return;

            var detailData = this.model.get("detailData");
            this.selectedPeakType = _.find(_.keys(this.modelPeakKeys), function (peakName)
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

        templatePeakTypeNames: {
            power: "Peak Power",
            heartrate: "Peak Heart Rate",
            speed: "Peak Speed",
            pace: "Peak Pace",
            cadence: "Peak Cadence"
        },

        modelPeakKeys: {
            power: "peakPowers",
            pace: "peakSpeeds",
            heartrate: "peakHeartRates",
            cadence: "peakCadences",
            speed: "peakSpeeds"
        },

        formatMethods: {
            pace: TP.utils.conversion.formatPace,
            speed: TP.utils.conversion.formatSpeed
        },

        onSelectPeakType: function ()
        {
            this.selectedPeakType = this.$("#peakType").val();
            this.render();
        },

        onLapsClicked: function (e)
        {
            var lapIndex = $(e.target).data("lapindex");
            var detailData = this.model.get("detailData").toJSON();
            var lapData = detailData.lapsStats[lapIndex];
            lapData.workoutId = this.model.id;
            var statsForRange = new WorkoutStatsForRange(lapData);
            this.trigger("rangeselected", lapData.begin, lapData.end, statsForRange);
        },

        onEntireWorkoutClicked: function ()
        {
            var detailData = this.model.get("detailData").toJSON();
            var entireWorkoutData = detailData.totalStats;
            entireWorkoutData.workoutId = this.model.id;
            entireWorkoutData.name = "Entire Workout";
            var statsForRange = new WorkoutStatsForRange(entireWorkoutData);
            this.trigger("rangeselected", entireWorkoutData.begin, entireWorkoutData.end, statsForRange);
        },
        
        onPeaksClicked: function(e)
        {
            //var peakIndex = $(e.target).data("peakInterval");
            //var detailData = this.model.get("detailData").toJSON();
            //var intervalData = detailData.lapsStats[peakIndex];
            //intervalData.workoutId = this.model.id;
            //intervalData.name = "Peak " + i
            //var statsForRange = new WorkoutStatsForRange(intervalData);
            //this.trigger("rangeselected", intervalData.begin, intervalData.end, statsForRange);
        }
    });
});