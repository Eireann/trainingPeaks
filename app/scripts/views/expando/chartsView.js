define(
[
    "TP",
    "utilities/data/timeInZonesGenerator",
    "utilities/data/peaksGenerator",
    "views/charts/heartRateTimeInZonesChart",
    "views/charts/powerTimeInZonesChart",
    "views/charts/speedTimeInZonesChart",
    "views/charts/heartRatePeaksChart",
    "views/charts/powerPeaksChart",
    "views/charts/speedPeaksChart",
    "hbs!templates/views/expando/chartsTemplate"
],
function (TP, timeInZonesGenerator, ThePeaksGenerator, HRTimeInZonesChartView, PowerTimeInZonesChartView, SpeedTimeInZonesChartView, HRPeaksChartView, PowerPeaksChartView, SpeedPeaksChartView, chartsTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: chartsTemplate
        },

        getZoneChartViewsByMetricName: function (workoutTypeValueId)
        {
            var charts = {};
            charts["HeartRate"] = HRTimeInZonesChartView;
            charts["Power"] = PowerTimeInZonesChartView;
            if (workoutTypeValueId !== 2)
            {
                charts["Speed"] = SpeedTimeInZonesChartView;
            }
            return charts;
        },

        elByMetricName:
        {
            "HeartRate": ".heartRateContainer",
            "Power": ".powerContainer",
            "Speed": ".speedContainer"
        },

        zoneSettingNameByMetricName:
        {
            "HeartRate": "heartRateZones",
            "Power": "powerZones",
            "Speed": "speedZones"
        },

        getPeaksChartViewsByMetricName: function (workoutTypeValueId)
        {
            var charts = {};
            charts["HeartRate"] = HRPeaksChartView;
            charts["Power"] = PowerPeaksChartView;
            if (workoutTypeValueId !== 2)
            {
                charts["Speed"] = SpeedPeaksChartView;
            }
            return charts;
        },

        initialEvents: function ()
        {
            this.model.off("change", this.render);
            this.model.on("change:workoutTypeValueId", this.render, this);
            this.on("close", function () { this.model.off("change:workoutTypeValueId", this.render, this); });
        },

        onRender: function ()
        {
            var workoutTypeValueId = this.model.get("workoutTypeValueId");
            _.each(this.getZoneChartViewsByMetricName(workoutTypeValueId), function (ChartView, metric)
            {
                var timeInZones = timeInZonesGenerator(metric, this.zoneSettingNameByMetricName[metric], this.model.get("details"), this.model);
                var el = this.$el.find(this.elByMetricName[metric] + " > .timeInZonesChartContainer");
                var view = new ChartView({ timeInZones: timeInZones, el: el });
                el.css("height", "350px");
                el.css("width", "600px");
                view.render();
            }, this);

            _.each(this.getPeaksChartViewsByMetricName(workoutTypeValueId), function (ChartView, metric)
            {
                var timeInZones = timeInZonesGenerator(metric, this.zoneSettingNameByMetricName[metric], this.model.get("details"), this.model);
                var peaks = ThePeaksGenerator.generate(metric, this.model.get("details"));
                var el = this.$el.find(this.elByMetricName[metric] + " > .peaksChartContainer");
                var view = new ChartView({ peaks: peaks, timeInZones: timeInZones, el: el });
                el.css("height", "350px");
                el.css("width", "600px");
                view.render();
            }, this);
        },

        watchForControllerEvents: function()
        {
            this.on("controller:resize", this.setViewHeightAndWidth, this);
        },

        setViewHeightAndWidth: function (containerHeight, containerWidth)
        {
            $(".timeInZonesChartContainer").css("width", (containerWidth / 2) - 20);
        },
    });
});