define(
[
    "TP",
    "./peaksChart"
],
function(TP, PeaksChartView)
{
    return PeaksChartView.extend(
    {
        chartColor: { light: "#0E7FCF", dark: "#0B568D" },

        graphTitle: "Pace",
        
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
                        text: this.formatPeakUnitsLabel(1).toUpperCase()
                    },
                    labels:
                    {
                        enabled: false
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
                        value: TP.utils.conversion.formatPace(point.value) + " " + this.formatPeakUnitsLabel(point.value)
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