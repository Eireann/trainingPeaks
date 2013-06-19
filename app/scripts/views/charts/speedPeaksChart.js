define(
[
    "TP",
    "./peaksChart",
    "utilities/charting/chartColors"
],
function(TP, PeaksChartView, chartColors)
{
    return PeaksChartView.extend(
    {
        chartColor: chartColors.gradients.pace,

        initialize: function(options)
        {
            this.workoutType = options.workoutType;
            this.constructor.__super__.initialize.call(this,
            {
                peaks: options.peaks,
                timeInZones: options.timeInZones,
                chartColor: this.chartColor,
                toolTipBuilder: this.toolTipBuilder
            });

            this.model = new TP.Model({
                peakType: "Pace",
                yAxisLabel: this.formatPeakUnitsLabel()
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
                        value: TP.utils.conversion.formatPace(peak.value) + " " + this.formatPeakUnitsLabel(peak.value)
                    }
                ]
            };
        },

        formatPeakUnitsLabel: function()
        {
            return "min/" + TP.utils.units.getUnitsLabel("distance", this.workoutType);
        },

        formatYAxisTick: function(value, series)
        {
            return TP.utils.conversion.formatPace(value);
        }

    });
});