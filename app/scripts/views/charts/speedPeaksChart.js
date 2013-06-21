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
                        value: TP.utils.conversion.formatPace(peak.value, { workoutTypeValueId: this.workoutType }) + " " + this.formatPeakUnitsLabel(peak.value)
                    }
                ]
            };
        },

        formatPeakUnitsLabel: function()
        {
            return TP.utils.units.getUnitsLabel("pace", this.workoutType);
        },

        formatYAxisTick: function(value, series)
        {
            return TP.utils.conversion.formatPace(value, { workoutTypeValueId: this.workoutType });
        }

    });
});