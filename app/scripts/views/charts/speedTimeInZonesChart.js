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
        chartColor: chartColors.gradients.pace,

        initialize: function(options)
        {
            this.workoutType = options.workoutType;
            this.constructor.__super__.initialize.call(this,
            {
                timeInZones: options.timeInZones,
                chartColor: this.chartColor,
                toolTipBuilder: this.toolTipBuilder
            });

            this.model = new TP.Model({
                zoneType: "Pace"
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
                        value: TP.utils.conversion.formatPace(timeInZone.minimum) + "-" + TP.utils.conversion.formatPace(timeInZone.maximum) + " " + this.formatPeakUnitsLabel()
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
        },
        
        formatPeakUnitsLabel: function (value, options)
        {
            return "min/" + TP.utils.units.getUnitsLabel("distance", this.workoutType);
        }
    });
});