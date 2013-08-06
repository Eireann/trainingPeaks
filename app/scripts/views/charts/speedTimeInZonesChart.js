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

            this.zoneType = options && options.hasOwnProperty("zoneType") ? options.zoneType : "Pace";

            this.model = new TP.Model({
                zoneType: this.zoneType
            });
        },
        
        toolTipBuilder: function(timeInZone, timeInZones)
        {

            var totalSeconds = TP.utils.chartBuilder.calculateTotalTimeInZones(timeInZones);
            var percentTime = TP.utils.conversion.toPercent(timeInZone.seconds, totalSeconds);
            var speedFormatter = this.zoneType === "Pace" ? "formatPace" : "formatSpeed";
            return {       
                tooltips: [
                    {
                        label: timeInZone.label
                    },
                    {
                        label: "Range",
                        value: TP.utils.conversion[speedFormatter](timeInZone.minimum, { workoutTypeValueId: this.workoutType }) + "-" + TP.utils.conversion[speedFormatter](timeInZone.maximum, { workoutTypeValueId: this.workoutType }) + " " + this.formatPeakUnitsLabel()
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
            return this.zoneType === "Pace" ? "min/" + TP.utils.units.getUnitsLabel("distance", this.workoutType) : TP.utils.units.getUnitsLabel("speed", this.workoutType);
        }
    });
});