define(
[
    "TP",
    "./timeInZonesChart"
],
function(TP, TimeInZonesChartView)
{
    return TimeInZonesChartView.extend(
    {
        chartColor: { light: "#ED3F1D", dark: "#B50F00" },

        graphTitle: "Pace",
        
        initialize: function(options)
        {
            this.workoutType = options.workoutType;
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
            _.extend(point, {
                tooltips: [
                    {
                        label: point.label
                    },
                    {
                        label: "Range",
                        value: TP.utils.conversion.formatPace(timeInZone.minimum) + "-" + TP.utils.conversion.formatPace(timeInZone.maximum) + " " + this.formatPeakUnitsLabel(point.value)
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
        },
        
        formatPeakUnitsLabel: function (value, options)
        {
            return "min/" + TP.utils.units.getUnitsLabel("distance", this.workoutType);
        }
    });
});