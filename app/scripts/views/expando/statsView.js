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
            this.watchForControllerResize();
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
            var workoutData = this.model.toJSON();
            var detailData = this.model.get("detailData").toJSON();
            var lapData = detailData.totalStats ? detailData.totalStats : {};
            lapData.name = "Entire Workout";
            _.extend(workoutData, lapData);
            return workoutData;
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
            this.$el.parent().height(Math.round(containerHeight * 0.4));
        }

    };

    return TP.ItemView.extend(expandoStatsView);
});