define(
[
    "TP",
    "utilities/data/timeInZonesGenerator",
    "views/charts/heartRateTimeInZonesChart",
    "views/charts/powerTimeInZonesChart",
    "views/charts/speedTimeInZonesChart",
    "hbs!templates/views/expando/chartsTemplate"
],
function(TP, timeInZonesGenerator, HRTimeInZonesChartView, PowerTimeInZonesChartView, SpeedTimeInZonesChartView, chartsTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: chartsTemplate
        },

        viewsByMetricName:
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

        initialEvents: function()
        {
            this.model.off("change", this.render);
        },
        
        onRender: function()
        {
            _.each(this.viewsByMetricName, function(View, metric)
            {
                var timeInZones = timeInZonesGenerator(metric, this.zoneSettingNameByMetricName[metric], this.model.get("details"), this.model);
                var el = this.$el.find(this.elByMetricName[metric] + " > .timeInZonesChartContainer");
                var view = new View({ timeInZones: timeInZones, el: el });
                el.css("height", "350px");
                el.css("width", "600px");
                view.render();
            }, this);
        }
    });
});