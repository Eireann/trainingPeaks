define(
[
    "TP",
    "./peaksChart"
],
function(TP, PeaksChartView)
{
    return PeaksChartView.extend(
    {
        chartColor: { light: "#ED3F1D", dark: "#B50F00" },

        graphTitle: "HeartRate",
        
        initialize: function(options)
        {
            this.workoutType = options.workoutType;
            this.constructor.__super__.initialize.call(this,
            {
                peaks: options.peaks,
                timeInZones: options.timeInZones,
                chartColor: this.chartColor,
                graphTitle: this.graphTitle,
                chartModifier: function()
                {
                },
                toolTipBuilder: this.toolTipBuilder
            });
        },

        toolTipBuilder: function(point, peak, timeInZones)
        {
            _.extend(point,
            {
                tooltips:
                [
                    {
                        label: point.label
                    },
                    {
                        value: point.value + " BPM"
                    },
                    {
                        value: TP.utils.conversion.toPercent(peak.value, timeInZones.threshold) + " %lt"
                    },
                    {
                        value: TP.utils.conversion.toPercent(peak.value, timeInZones.maximum) + " %Max"
                    }
                ]
            });
        }
    });
});