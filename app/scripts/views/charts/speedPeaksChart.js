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

            this.peakType = options && options.hasOwnProperty("peakType") ? options.peakType : "Pace";
            this.model = new TP.Model({
                peakType: this.peakType,
                yAxisLabel: this.formatPeakUnitsLabel()
            });
        },

        toolTipBuilder: function(peak, timeInZones)
        {
            var speedFormatter = this.peakType === "Pace" ? "formatPace" : "formatSpeed";
            return {
                tooltips:
                [
                    {
                        label: peak.label
                    },
                    {
                        value: TP.utils.conversion[speedFormatter](peak.value, { workoutTypeValueId: this.workoutType }) + " " + this.formatPeakUnitsLabel(peak.value)
                    }
                ]
            };
        },

        formatPeakUnitsLabel: function()
        {
            return TP.utils.units.getUnitsLabel(this.peakType.toLowerCase(), this.workoutType);
        },

        formatYAxisTick: function(value, series)
        {
            var speedFormatter = this.peakType === "Pace" ? "formatPace" : "formatSpeed";
            return TP.utils.conversion[speedFormatter](value, { workoutTypeValueId: this.workoutType });
        }

    });
});