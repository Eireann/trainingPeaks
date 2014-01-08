define(
[
    "underscore",
    "TP",
    "./timeInZonesChart",
    "utilities/charting/chartColors"
],
function(_, TP, TimeInZonesChartView, chartColors)
{
    return TimeInZonesChartView.extend(
    {
        dataChannel: "HeartRate",

        chartColor: chartColors.gradients.heartRate,

        initialize: function(options)
        {
            this.constructor.__super__.initialize.call(this,
            _.defaults({
                chartColor: this.chartColor,
                toolTipBuilder: this.toolTipBuilder
            }, options));

            this.chartModel = new TP.Model({
                zoneType: "Heart Rate"
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
                        value: timeInZone.minimum + "-" + timeInZone.maximum + " BPM"
                    },
                    {
                        label: "% lt",
                        value: TP.utils.conversion.toPercent(timeInZone.minimum, this.timeInZones.threshold) +
                            "-" + TP.utils.conversion.toPercent(timeInZone.maximum, this.timeInZones.threshold) + " %"

                    },
                    {
                        label: "% Max",
                        value: TP.utils.conversion.toPercent(timeInZone.minimum, this.timeInZones.maximum) +
                            "-" + TP.utils.conversion.toPercent(timeInZone.maximum, this.timeInZones.maximum) + " %"

                    },
                    {
                        label: "Time",
                        value: TP.utils.conversion.formatUnitsValue("seconds", timeInZone.seconds)
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