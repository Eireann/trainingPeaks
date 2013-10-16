define(
[
    "underscore",
    "TP",
    "./peaksChart",
    "utilities/charting/chartColors"
],
function(_, TP, PeaksChartView, chartColors)
{
    return PeaksChartView.extend(
    {
        chartColor: chartColors.gradients.heartRate,

        dataChannel: "HeartRate", 

        initialize: function(options)
        {
            this.workoutType = options.workoutType;
            this.constructor.__super__.initialize.call(this,
            _.defaults({
                peaks: options.peaks,
                timeInZones: options.timeInZones,
                chartColor: this.chartColor,
                toolTipBuilder: this.toolTipBuilder
            }, options));

            this.chartModel = new TP.Model({
                peakType: "Heart Rate",
                yAxisLabel: "BPM"
            });
        },

        toolTipBuilder: function(peak, timeInZones)
        {
            return {
                tooltips:
                [
                    {
                        label: peak.label
                    },
                    {
                        value: peak.value + " BPM"
                    },
                    {
                        value: TP.utils.conversion.toPercent(peak.value, timeInZones.threshold) + " %lt"
                    },
                    {
                        value: TP.utils.conversion.toPercent(peak.value, timeInZones.maximum) + " %Max"
                    }
                ]
            };
        }
    });
});