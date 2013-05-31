define(
[
    "TP",
    "./peaksChart"
],
function(TP, PeaksChartView)
{
    return PeaksChartView.extend(
    {
        chartColor: { light: "#8106C9", dark: "#590888" },

        graphTitle: "Power",
        
        initialize: function(options)
        {
            this.workoutType = options.workoutType;
            this.constructor.__super__.initialize.call(this,
            {
                peaks: options.peaks,
                timeInZones: options.timeInZones,
                chartColor: this.chartColor,
                graphTitle: this.graphTitle,
                chartModifier: this.chartModifier,
                toolTipBuilder: this.toolTipBuilder
            });
        },
        
        chartModifier: function(chartOptions, chartPoints)
        {
            _.extend(chartOptions,
            {
                yAxis:
                {
                    title:
                    {
                        text: "WATTS"
                    }
                }
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
                        value: TP.utils.conversion.formatInteger(point.value) + " Watts"
                    }
                ]
            });
        }
    });
});