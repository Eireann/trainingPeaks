define(
[
    "TP",
    "./expandoCommon",
    "hbs!templates/views/expando/statsTemplate"
],
function(
    TP,
    expandoCommon,
    statsTemplate
    )
{
    var expandoStatsView =
    {

        className: "expandoStats",

        template:
        {
            type: "handlebars",
            template: statsTemplate
        },

        initialize: function()
        {
            this.on("controller:rangeselected", this.onRangeSelected, this);
        },

        serializeData: function()
        {
            var lapData = this.getLapData();
            expandoCommon.calculateTotalAndMovingTime(lapData);
            this.findAvailableMinMaxAvgFields(lapData);
            return lapData;
        },

        getLapData: function()
        {
            if (this.selectedRangeData)
            {
                return this.selectedRangeData;
            }
            else
            {
                var detailData = this.model.get("detailData").toJSON();
                var lapData = detailData.totalStats ? detailData.totalStats : {};
                lapData.name = "Entire Workout";
                return lapData;
            }
        },
        
        onRangeSelected: function (startOffsetMs, endOffsetMs, rangeData)
        {
            if (rangeData)
            {
                this.selectedRangeData = rangeData.toJSON();;
                if (!this.selectedRangeData.name)
                {
                    this.selectedRangeData.name = "Selection";
                }
                this.render();
            }
        },

        findAvailableMinMaxAvgFields: function(lapData)
        {
            lapData.minMaxAvg = false;

            if (this.hasAnyValue(lapData, ["minimumPower", "averagePower", "maximumPower"]))
                lapData.minMaxPower = lapData.minMaxAvg = true;

            if (this.hasAnyValue(lapData, ["minimumSpeed", "averageSpeed", "maximumSpeed"]))
                lapData.minMaxSpeed = lapData.minMaxAvg = true;

            if (this.hasAnyValue(lapData, ["minimumHeartRate", "averageHeartRate", "maximumHeartRate"]))
                lapData.minMaxHeartRate = lapData.minMaxAvg = true;

            if (this.hasAnyValue(lapData, ["minimumCadence", "averageCadence", "maximumCadence"]))
                lapData.minMaxCadence = lapData.minMaxAvg = true;

            if (this.hasAnyValue(lapData, ["elevationMinimum", "elevationAverage", "elevationMaximum"]))
                lapData.minMaxElevation = lapData.minMaxAvg = true;

            if (this.hasAnyValue(lapData, ["tempMin", "tempAvg", "tempMax"]))
                lapData.minMaxTemp = lapData.minMaxAvg = true;

        },

        hasAnyValue: function(context, keys)
        {
            var keyWithAValue = _.find(keys, function(key)
            {
                return !_.isUndefined(context[key]) && !_.isNull(context[key]);
            });

            return keyWithAValue ? true : false;
        }
    };

    return TP.ItemView.extend(expandoStatsView);
});