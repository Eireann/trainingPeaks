define(
[
    "underscore",
    "TP",
    "utilities/data/peaksGenerator",
    "views/charts/heartRatePeaksChart",
    "views/charts/powerPeaksChart",
    "views/charts/speedPeaksChart",
    "hbs!templates/views/quickView/zonesTab/peakTableRow"
],
function(
    _,
    TP,
    peaksGenerator,
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

            this.on("render", this.renderPeaks, this);

            this.once("render", function()
            {
                // big change - i.e. initial load from server - rerender whole tab
                this.listenTo(this.model, "change:meanMax" + this.metric + "s", _.bind(this.reRenderOnChange, this));

                // small change - i.e. stickit edit, just update the graph
                this.listenTo(this.model, "change:meanMax" + this.metric + "s.meanMaxes.*", _.bind(this.onPeaksChange, this));
            }, this);

        },

        renderPeaks: function()
        {
            this.renderPeaksTable();
            this.renderPeaksChart();
        },

        onPeaksChange: function()
        {
            this.trigger("change:model", this.model);
        },

        renderPeaksTable: function()
        {
            var peaks = peaksGenerator.generate(this.metric, this.model);
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

        renderPeaksChart: function()
        {
            var view;
            if (this.metric === "HeartRate")
            {
                view = new HRPeaksChartView({ model: this.workoutModel, el: this.$(".peaksChart") });
                view.render();
            }
            else if (this.metric === "Power")
            {
                view = new PowerPeaksChartView({ model: this.workoutModel, el: this.$(".peaksChart") });
                view.render();
            }
            else if (this.metric === "Speed")
            {
                view = new SpeedPeaksChartView({ model: this.workoutModel, el: this.$(".peaksChart"), workoutType: this.workoutModel.get("workoutTypeValueId"), peakType: this.graphTitle });
                view.render();
            }
        }
    };

    return peaksMixin;

});