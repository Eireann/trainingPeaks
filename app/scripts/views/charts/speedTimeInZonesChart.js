﻿define(
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
        chartColor: chartColors.gradients.pace,

        dataChannel: "Speed",

        initialize: function(options)
        {
            this.workoutType = options.workoutType;
            this.constructor.__super__.initialize.call(this,
            _.defaults({
                timeInZones: options.timeInZones,
                chartColor: this.chartColor,
                toolTipBuilder: this.toolTipBuilder
            }, options));

            this.zoneType = options && options.hasOwnProperty("zoneType") ? options.zoneType : "Pace";
            this.chartModel = new TP.Model({
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
            return this.zoneType === "Pace" ? TP.utils.units.getUnitsLabel("pace", this.workoutType) : TP.utils.units.getUnitsLabel("speed", this.workoutType);
        }
    });
});