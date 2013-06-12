define(
[
    "TP",
    "./timeInZonesChart",
    "utilities/charting/chartColors"
],
function(TP, TimeInZonesChartView, chartColors)
{
    return TimeInZonesChartView.extend(
    {
        chartColor: chartColors.gradients.power,

        graphTitle: "Power",
        
        initialize: function(options)
        {
            this.constructor.__super__.initialize.call(this,
            {
                timeInZones: options.timeInZones,
                chartColor: this.chartColor,
                graphTitle: this.graphTitle,
                toolTipBuilder: this.toolTipBuilder
            });
        },
        
        toolTipBuilder: function(point, timeInZone)
        {
            _.extend(point,
            {
                tooltips: [
                    {
                        label: point.label
                    },
                    {
                        label: "Range",
                        value: TP.utils.conversion.formatInteger(timeInZone.minimum, { defaultValue: "0" }) + "-" + TP.utils.conversion.formatInteger(timeInZone.maximum, { defaultValue: "0" }) + " Watts"
                    },
                    {
                        label: "% FTP",
                        value: TP.utils.conversion.toPercent(timeInZone.minimum, this.timeInZones.threshold) +
                            "-" + TP.utils.conversion.toPercent(timeInZone.maximum, this.timeInZones.threshold) + " %"
                    },
                    {
                        label: "Watts/Weight",
                        value: ""

                    },
                    {
                        label: "Time",
                        value: TP.utils.conversion.formatDurationFromSeconds(timeInZone.seconds)
                    },
                    {
                        label: "Percent",
                        value: point.percentTime + "%"
                    }
                ]
            });
        }
    });
});