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
        chartColor: chartColors.gradients.pace,

        dataChannel: "Speed",

        initialize: function(options)
        {
            this.workoutType = options.workoutType;
            this.constructor.__super__.initialize.call(this,
            _.defaults({
                chartColor: this.chartColor,
                toolTipBuilder: this.toolTipBuilder
            }, options));

            this.peakType = options && options.hasOwnProperty("peakType") ? options.peakType : "Pace";
            this.chartModel = new TP.Model({
                peakType: this.peakType,
                yAxisLabel: this.formatPeakUnitsLabel()
            });
        },

        toolTipBuilder: function(peak, timeInZones)
        {
            var speedFormatter = this.peakType === "Pace" ? "pace" : "speed";
            return {
                tooltips:
                [
                    {
                        label: peak.label
                    },
                    {
                        value: TP.utils.conversion.formatUnitsValue(speedFormatter, peak.value, { workoutTypeValueId: this.workoutType }) + " " + this.formatPeakUnitsLabel(peak.value)
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
            var speedFormatter = this.peakType === "Pace" ? "pace" : "speed";
            return TP.utils.conversion.formatUnitsValue(speedFormatter, value, { workoutTypeValueId: this.workoutType });
        }

    });
});