define(
[
    "underscore",
    "TP",
    "utilities/data/timeInZonesGenerator",
    "utilities/data/peaksGenerator",
    "views/charts/heartRatePeaksChart",
    "views/charts/powerPeaksChart",
    "views/charts/speedPeaksChart",
    "hbs!templates/views/quickView/zonesTab/peakTableRow"
],
function(
    _,
    TP,
    timeInZonesGenerator,
    ThePeaksGenerator,
    HRPeaksChartView,
    PowerPeaksChartView,
    SpeedPeaksChartView,
    peakRowTemplate
)
{
    var peaksMixin =
    {

        initializePeaks: function()
        {
            if (!this.metric)
                throw "peaks mixin requires a metric name (this.metric)";

            this.on("render", this.onRenderPeaks, this);
        },

        onRenderPeaks: function()
        {
            this.renderPeaks();
            this.watchForPeaksChanges();
        },

        watchForPeaksChanges: function()
        {
            // big change - i.e. initial load from server - rerender whole tab
            this.model.on("change:meanMax" + this.metric + "s", this.reRenderOnChange, this);

            // small change - i.e. stickit edit, just update the graph
            this.model.on("change:meanMax" + this.metric + "s.meanMaxes.*", this.onPeaksChange, this);
            this.on("close", this.stopWatchingPeaksChanges, this);
        },

        stopWatchingPeaksChanges: function()
        {
            this.model.off("change:meanMax" + this.metric + "s", this.reRenderOnChange, this);
            this.model.off("change:meanMax" + this.metric + "s.meanMaxes.*", this.onPeaksChange, this);
        },

        renderPeaks: function()
        {
            var timeInZones = timeInZonesGenerator(this.metric, this.zoneSettingName, this.model, this.workoutModel);
            var peaks = ThePeaksGenerator.generate(this.metric, this.model);
            this.renderPeaksTable(peaks);
            this.renderPeaksChart(peaks, timeInZones);
        },

        onPeaksChange: function()
        {
            var timeInZones = timeInZonesGenerator(this.metric, this.zoneSettingName, this.model, this.workoutModel);
            var peaks = ThePeaksGenerator.generate(this.metric, this.model);
            this.renderPeaksChart(peaks, timeInZones);
            this.trigger("change:model", this.model);
        },

        renderPeaksTable: function(peaks)
        {
            if (peaks)
            {
                var peaksHtml = peakRowTemplate({ peaks: peaks });
                this.$(".peaksTable").html(peaksHtml);
            }
            else
            {
                this.$(".peaksTable").html("");
            }
        },

        renderPeaksChart: function(peaks, timeInZones)
        {
            var view;
            if (this.metric === "HeartRate")
            {
                view = new HRPeaksChartView({ el: this.$(".peaksChart"), peaks: peaks, timeInZones: timeInZones });
                view.render();
            }
            else if (this.metric === "Power")
            {
                view = new PowerPeaksChartView({ el: this.$(".peaksChart"), peaks: peaks, timeInZones: timeInZones });
                view.render();
            }
            else if (this.metric === "Speed")
            {
                view = new SpeedPeaksChartView({ el: this.$(".peaksChart"), peaks: peaks, timeInZones: timeInZones, workoutType: this.workoutModel.get("workoutTypeValueId") });
                view.render();
            }
        }
    };

    return peaksMixin;

});