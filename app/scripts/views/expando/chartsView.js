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
            charts["Speed"] = SpeedTimeInZonesChartView;

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
            charts["Speed"] = SpeedPeaksChartView;

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
                if(timeInZones)
                {
                    var zoneType = _.contains([3,13,12], this.model.get("workoutTypeValueId")) ? "Pace" : "Speed";
                    var el = this.$el.find(this.elByMetricName[metric] + " > .timeInZonesChartContainer");
                    var view = new ChartView({ timeInZones: timeInZones, el: el, workoutType: this.model.get("workoutTypeValueId"), zoneType: zoneType });
                    el.css("height", "233px");
                    el.css("width", "400px");
                    view.render();
                    this.viewListensForResize(view);
                }
            }, this);

            _.each(this.getPeaksChartViewsByMetricName(workoutTypeValueId), function (ChartView, metric)
            {
                var timeInZones = timeInZonesGenerator(metric, this.zoneSettingNameByMetricName[metric], this.model.get("details"), this.model);
                if(timeInZones)
                {
                    var peaks = ThePeaksGenerator.generate(metric, this.model.get("detailData"));
                    var peakType = _.contains([3,13,12], this.model.get("workoutTypeValueId")) ? "Pace" : "Speed";
                    var el = this.$el.find(this.elByMetricName[metric] + " > .peaksChartContainer");
                    var view = new ChartView({ peaks: peaks, timeInZones: timeInZones, el: el, workoutType: this.model.get("workoutTypeValueId"), peakType: peakType });
                    el.css("height", "233px");
                    el.css("width", "400px");
                    view.render();
                    this.viewListensForResize(view);
                }
            }, this);

            this.watchForControllerEvents();

        },

        viewListensForResize: function(view)
        {
            this.on("chartResize", function (width)
            {
                view.trigger("chartResize", width);
            });
        },

        watchForControllerEvents: function()
        {
            this.on("controller:resize", this.setViewHeightAndWidth, this);
        },

        setViewHeightAndWidth: function (containerHeight, containerWidth)
        {
            var width = (containerWidth / 2) * 0.95;
            var height = width * 0.65;
            this.$(".timeInZonesChartContainer").width(width).height(height);
            this.$(".peaksChartContainer").width(width).height(height);
        }
    });
});