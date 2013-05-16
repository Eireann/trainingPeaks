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
            var lapData = detailData.totalStats;
            _.extend(workoutData, lapData);
            return workoutData;
        },

        calculateMovingTime: function(lapData)
        {
            if (lapData.stoppedTime)
                lapData.movingTime = lapData.totalTime - lapData.stoppedTime;
        },

        findAvailableMinMaxAvgFields: function(lapData)
        {
            if (lapData.minimumPower !== null || lapData.averagePower !== null || lapData.maximumPower !== null)
                lapData.minMaxPower = true;

            if (lapData.minimumSpeed !== null || lapData.averageSpeed !== null || lapData.maximumSpeed !== null)
                lapData.minMaxSpeed = true;

            if (lapData.minimumHeartRate !== null || lapData.averageHeartRate !== null || lapData.maximumHeartRate !== null)
                lapData.minMaxHeartRate = true;

            if (lapData.minimumCadence !== null || lapData.averageCadence !== null || lapData.maximumCadence !== null)
                lapData.minMaxCadence = true;

            if (lapData.elevationMinimum !== null || lapData.elevationAverage !== null || lapData.elevationMaximum !== null)
                lapData.minMaxElevation = true;

            if (lapData.tempAvg !== null || lapData.tempMax !== null || lapData.tempMin !== null)
                lapData.minMaxTemp = true;
        }

    };

    return TP.ItemView.extend(expandoStatsView);
});