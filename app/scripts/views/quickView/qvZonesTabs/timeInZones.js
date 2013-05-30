define(
[
    "underscore",
    "TP",
    "utilities/data/timeInZonesGenerator",
    "views/charts/heartRateTimeInZonesChart",
    "views/charts/powerTimeInZonesChart",
    "views/charts/speedTimeInZonesChart",
    "hbs!templates/views/quickView/zonesTab/zoneTableRow"
],
function(_, TP, timeInZonesGenerator, HeartRateTimeInZonesChartView, PowerTimeInZonesChartView, SpeedTimeInZonesChartView, zoneRowTemplate)
{
    var timeInZonesMixin =
    {
        initializeTimeInZones: function()
        {
            if (!this.metric)
                throw "zones mixin requires a metric name (this.metric)";

            this.on("render", this.onRenderTimeInZones, this);
        },

        onRenderTimeInZones: function()
        {
            this.renderTimeInZones();
            this.watchForTimeInZonesChanges();
        },

        watchForTimeInZonesChanges: function()
        {
            // big change - i.e. initial load from server - rerender whole tab
            this.model.on("change:timeIn" + this.metric + "Zones.timeInZones", this.reRenderOnChange, this);

            // small change - i.e. stickit edit, just update the graph
            this.model.on("change:timeIn" + this.metric + "Zones.timeInZones.*", this.onTimeInZonesChange, this);
            this.on("close", this.stopWatchingTimeInZonesChanges, this);
        },

        stopWatchingTimeInZonesChanges: function()
        {
            this.model.off("change:timeIn" + this.metric + "Zones.timeInZones", this.reRenderOnChange, this);
            this.model.off("change:timeIn" + this.metric + "Zones.timeInZones.*", this.onTimeInZonesChange, this);
        },

        renderTimeInZones: function()
        {
            var timeInZones = timeInZonesGenerator(this.metric, this.zoneSettingName, this.model, this.workoutModel);
            this.renderTimeInZonesTable(timeInZones);
            this.renderTimeInZonesChart(timeInZones);
        },

        onTimeInZonesChange: function()
        {
            var timeInZones = timeInZonesGenerator(this.metric, this.zoneSettingName, this.model, this.workoutModel);
            this.renderTimeInZonesChart(timeInZones);
            this.trigger("change:model", this.model);
        },

        renderTimeInZonesTable: function(timeInZones)
        {
            if (timeInZones)
            {
                var zonesHtml = zoneRowTemplate(timeInZones);
                this.$(".zonesTable").html(zonesHtml);
            }
            else
            {
                this.$(".zonesTable").html("");
            }
        },

        renderTimeInZonesChart: function(timeInZones)
        {
            var view;
            if (this.metric === "HeartRate")
            {
                view = new HeartRateTimeInZonesChartView({ el: this.$(".zonesChart"), timeInZones: timeInZones });
                view.render();
            }
            else if (this.metric === "Power")
            {
                view = new PowerTimeInZonesChartView({ el: this.$(".zonesChart"), timeInZones: timeInZones });
                view.render();
            }
            else if (this.metric === "Speed")
            {
                view = new SpeedTimeInZonesChartView({ el: this.$(".zonesChart"), timeInZones: timeInZones });
                view.render();
            }
        }
    };

    return timeInZonesMixin;

});