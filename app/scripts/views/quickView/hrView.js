define(
[
    "underscore",
    "TP",
    "views/quickView/qvZonesTabs/baseView"
],
function(_, TP, zonesViewBase)
{
    var hrViewBase =
    {
        metric: "HeartRate",
        zoneSettingName: "heartRateZones",
        graphTitle: "Heart Rate",
        className: "quickViewHrTab",

        initialize: function(options)
        {
            this.initializeBaseView(options);
            this.on("buildPeakChartPoint", this.addTooltipDataToPeakChartPoint, this);
            this.on("buildPeakStickitBinding", this.addFormattersToPeakStickitBinding, this);
            this.on("buildTimeInZoneStickitBinding", this.addFormattersToTimeInZoneStickitBinding, this);
        },

        addTooltipDataToPeakChartPoint: function(point, peak, timeInZones)
        {
            _.extend(point,
            {
                tooltips: [
                    {
                        label: point.label
                    },
                    {
                        value: point.value + " BPM"
                    },
                    {
                        value: TP.utils.conversion.toPercent(peak.value, timeInZones.threshold) + " %lt"
                    },
                    {
                        value: TP.utils.conversion.toPercent(peak.value, timeInZones.maximum) + " %Max"
                    }
                ]
            });
        },

        addFormattersToPeakStickitBinding: function(binding, peak)
        {
            _.extend(binding,
            {
                onGet: "formatInteger",
                onSet: "parseInteger"
            });
        },

        addFormattersToTimeInZoneStickitBinding: function(binding, timeInZone)
        {
            _.extend(binding,
            {
                onGet: "formatDurationFromSeconds",
                onSet: "parseDurationAsSeconds"
            });
        }

    };

    _.extend(hrViewBase, zonesViewBase);

    hrViewBase.chartColor = { light: "#ED3F1D", dark: "#B50F00" };

    return TP.ItemView.extend(hrViewBase);
});
