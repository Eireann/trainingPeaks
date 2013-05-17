define(
[
    "TP",
    "hbs!templates/views/expando/statsTemplate"
],
function(
    TP,
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

        serializeData: function()
        {
            var lapData = this.getLapData();
            this.calculateMovingTime(lapData);
            this.findAvailableMinMaxAvgFields(lapData);
            return lapData;
        },

        getLapData: function()
        {
            var workoutData = this.model.toJSON();
            var detailData = this.model.get("detailData").toJSON();
            var lapData = detailData.totalStats ? detailData.totalStats : {};
            lapData.name = "Entire Workout";
            _.extend(workoutData, lapData);
            return workoutData;
        },

        calculateMovingTime: function(lapData)
        {
            // NOTE: stoppedTime is in milliseconds, totalTime is in decimal hours
            if (lapData.stoppedTime)
            {
                var stoppedTime = (lapData.stoppedTime / 1000) / 3600;
                lapData.movingTime = lapData.totalTime - stoppedTime;
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