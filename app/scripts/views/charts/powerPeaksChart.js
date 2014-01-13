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
        chartColor: chartColors.gradients.power,

        dataChannel: "Power",

        initialize: function(options)
        {
            this.workoutType = options.workoutType;
            this.constructor.__super__.initialize.call(this,
            _.defaults({
                chartColor: this.chartColor,
                toolTipBuilder: this.toolTipBuilder
            }, options));

            this.chartModel = new TP.Model({
                peakType: "Power",
                yAxisLabel: "Watts"
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
                        value: TP.utils.conversion.formatUnitsValue("power", peak.value) + " Watts"
                    }
                ]
            };
        }
    });
});