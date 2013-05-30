﻿define(
[
    "TP",
    "./timeInZonesChart"
],
function(TP, TimeInZonesChartView)
{
    return TimeInZonesChartView.extend(
    {
        chartColor: { light: "#ED3F1D", dark: "#B50F00" },

        graphTitle: "HeartRate",
        
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
                tooltips:
                [
                    {
                        label: point.label
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