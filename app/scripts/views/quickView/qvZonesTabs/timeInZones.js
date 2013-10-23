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
function(
         _,
         TP,
         timeInZonesGenerator,
         HeartRateTimeInZonesChartView,
         PowerTimeInZonesChartView,
         SpeedTimeInZonesChartView,
         zoneRowTemplate)
{
    var timeInZonesMixin =
    {
        initializeTimeInZones: function()
        {
            if (!this.metric)
                throw "zones mixin requires a metric name (this.metric)";

            this.on("render", this.renderTimeInZones, this);

            this.once("render", function()
            {
                // big change / reset = re-render
                this.listenTo(this.model, "change:timeIn" + this.metric + "Zones.timeInZones", _.bind(this.reRenderOnChange, this));

                // small change, just trigger so qv knows to enable save
                this.listenTo(this.model, "change:timeIn" + this.metric + "Zones.timeInZones.*", _.bind(this.onTimeInZonesChange, this));
            }, this);

        },

        renderTimeInZones: function()
        {
            this.renderTimeInZonesTable();
            this.renderTimeInZonesChart();
        },

        onTimeInZonesChange: function()
        {
            this.trigger("change:model", this.model);
        },

        renderTimeInZonesTable: function()
        {
            var timeInZones = timeInZonesGenerator(this.metric, this.zoneSettingName, this.model, this.workoutModel);
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
                view = new HeartRateTimeInZonesChartView({ model: this.workoutModel, el: this.$(".zonesChart") });
                view.render();
            }
            else if (this.metric === "Power")
            {
                view = new PowerTimeInZonesChartView({ model: this.workoutModel, el: this.$(".zonesChart") });
                view.render();
            }
            else if (this.metric === "Speed")
            {
                view = new SpeedTimeInZonesChartView({ model: this.workoutModel, el: this.$(".zonesChart"), workoutType: this.workoutModel.get("workoutTypeValueId"), zoneType: this.graphTitle });
                view.render();
            }
        }
    };

    return timeInZonesMixin;

});