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

        initialize: function(options)
        {
            this.constructor.__super__.initialize.call(this,
            {
                timeInZones: options.timeInZones,
                chartColor: this.chartColor,
                toolTipBuilder: this.toolTipBuilder
            });

            this.model = new TP.Model({
                zoneType: "Power"
            });
        },

        toolTipBuilder: function(timeInZone, timeInZones)
        {

            var totalSeconds = TP.utils.chartBuilder.calculateTotalTimeInZones(timeInZones);
            var percentTime = TP.utils.conversion.toPercent(timeInZone.seconds, totalSeconds);
            return {       
                tooltips: [
                    {
                        label: timeInZone.label
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
                        label: "Time",
                        value: TP.utils.conversion.formatDurationFromSeconds(timeInZone.seconds)
                    },
                    {
                        label: "Percent",
                        value: percentTime + "%"
                    }
                ]
            };
        }
    });
});