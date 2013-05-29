define(
[
    "underscore",
    "TP",
    "views/quickView/qvZonesTabs/baseView"
],
function(
    _,
    TP,
    zonesViewBase
)
{
    var hrViewBase = {
        metric: "HeartRate",
        zoneSettingName: "heartRateZones",
        graphTitle: "Heart Rate",
        className: "quickViewHrTab",

        initialize: function(options)
        {
            this.initializeBaseView(options);
            this.on("buildPeakChartPoint", this.addTooltipDataToPeakChartPoint, this);
            this.on("buildTimeInZoneChartPoint", this.addTooltipDataToTimeInZoneChartPoint, this);
            this.on("buildPeakStickitBinding", this.addFormattersToPeakStickitBinding, this);
            this.on("buildTimeInZoneStickitBinding", this.addFormattersToTimeInZoneStickitBinding, this);
        },

        addTooltipDataToPeakChartPoint: function(point, peak, timeInZones)
        {
            _.extend(point, {
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

        addTooltipDataToTimeInZoneChartPoint: function(point, timeInZone, timeInZones)
        {
            _.extend(point, {
                tooltips: [
                    {
                        label: point.label
                    },
                    {
                        label: "Range",
                        value: timeInZone.minimum + "-" + timeInZone.maximum + " BPM"
                    },
                    {
                        label: "% lt",
                        value: TP.utils.conversion.toPercent(timeInZone.minimum, timeInZones.threshold) +
                            "-" + TP.utils.conversion.toPercent(timeInZone.maximum, timeInZones.threshold) +
                            " %"

                    },
                    {
                        label: "% Max",
                        value: TP.utils.conversion.toPercent(timeInZone.minimum, timeInZones.maximum) +
                            "-" + TP.utils.conversion.toPercent(timeInZone.maximum, timeInZones.maximum) +
                            " %"

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

        addFormattersToPeakStickitBinding: function(binding, peak)
        {
            _.extend(binding, {
                onGet: "formatInteger",
                onSet: "parseInteger"
            });
        },

        addFormattersToTimeInZoneStickitBinding: function(binding, timeInZone)
        {
            _.extend(binding, {
                onGet: "formatDurationFromSeconds",
                onSet: "parseDurationAsSeconds"
            });
        }

    };

    _.extend(hrViewBase, zonesViewBase);

    hrViewBase.chartColor = { light: "#ED3F1D", dark: "#B50F00" };

    return TP.ItemView.extend(hrViewBase);
});
