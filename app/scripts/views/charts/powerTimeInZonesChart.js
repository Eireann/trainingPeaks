define(
[
    "TP",
    "./timeInZonesChart"
],
function(TP, TimeInZonesChartView)
{
    return TimeInZonesChartView.extend(
    {
        chartColor: { light: "#8106C9", dark: "#590888" },

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