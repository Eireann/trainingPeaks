define(
[
    "TP",
    "utilities/data/timeInZonesGenerator",
    "views/charts/heartRateTimeInZonesChart",
    "views/charts/powerTimeInZonesChart",
    "views/charts/speedTimeInZonesChart",
    "views/charts/heartRatePeaksChart",
    "views/charts/powerPeaksChart",
    "views/charts/speedPeaksChart",
    "hbs!templates/views/expando/chartsTemplate"
],
function(TP, timeInZonesGenerator, HRTimeInZonesChartView, PowerTimeInZonesChartView, SpeedTimeInZonesChartView, HRPeaksChartView, PowerPeaksChartView, SpeedPeaksChartView, chartsTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: chartsTemplate
        },

        zoneChartViewsByMetricName:
        {
            "HeartRate": HRTimeInZonesChartView,
            "Power": PowerTimeInZonesChartView,
            "Speed": SpeedTimeInZonesChartView
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

        peaksChartViewsByMetricName:
        {
            "HeartRate": HRPeaksChartView,
            "Power": PowerPeaksChartView,
            "Speed": SpeedPeaksChartView
        },

        initialEvents: function()
        {
            this.model.off("change", this.render);
        },
        
        onRender: function()
        {
            _.each(this.zoneChartViewsByMetricName, function(ChartView, metric)
            {
                var timeInZones = timeInZonesGenerator(metric, this.zoneSettingNameByMetricName[metric], this.model.get("details"), this.model);
                var el = this.$el.find(this.elByMetricName[metric] + " > .timeInZonesChartContainer");
                var view = new ChartView({ timeInZones: timeInZones, el: el });
                el.css("height", "350px");
                el.css("width", "600px");
                view.render();
            }, this);

            _.each(this.peaksChartViewsByMetricName, function(ChartView, metric)
            {
                var peaks = null;
                var el = this.$el.find(this.elByMetricName[metric] + " > .peaksChartContainer");
                var view = null;
            }, this);
        }
    });
});