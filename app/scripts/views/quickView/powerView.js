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
    var powerViewBase = {
        metric: "Power",
        zoneSettingName: "powerZones",
        graphTitle: "Power",
        className: "quickViewPowerTab",

        initialize: function(options)
        {
            this.initializeBaseView(options);
            this.on("buildPeakChartPoint", this.addTooltipDataToPeakChartPoint, this);
            this.on("buildTimeInZoneChartPoint", this.addTooltipDataToTimeInZoneChartPoint, this);
            this.on("buildPeakStickitBinding", this.addFormattersToPeakStickitBinding, this);
            this.on("buildTimeInZoneStickitBinding", this.addFormattersToTimeInZoneStickitBinding, this);
            this.on("additionalPeaksStickitBindings", this.addPeaksLabelStickitBindings, this);
            this.on("additionalTimeInZonesStickitBindings", this.addTimeInZonesLabelStickitBindings, this);
            this.on("buildPeaksChart", this.modifyPeaksChart, this);
        },

        addTooltipDataToPeakChartPoint: function(point, peak, timeInZones)
        {
            _.extend(point, {
                tooltips: [
                    {
                        label: point.label
                    },
                    {
                        value: this.formatInteger(point.value) + " " + this.formatPeakUnitsLabel(point.value)
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
                        value: this.formatInteger(timeInZone.minimum, { defaultValue: "0" }) + "-" + this.formatInteger(timeInZone.maximum, { defaultValue: "0" }) + " " + this.formatPeakUnitsLabel(point.value)
                    },
                    {
                        label: "% FTP",
                        value: TP.utils.conversion.toPercent(timeInZone.minimum, timeInZones.threshold) +
                            "-" + TP.utils.conversion.toPercent(timeInZone.maximum, timeInZones.threshold) +
                            " %"

                    },
                    {
                        label: "Watts/Weight",
                        value: ""

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
        },

        addPeaksLabelStickitBindings: function(bindings, peaks)
        {
            _.each(peaks, function(peak, index)
            {
                var unitsLabelCssId = "#" + peak.id + "UnitsLabel";
                var modelFieldName = "meanMax" + this.metric + "s.meanMaxes." + peak.modelArrayIndex + ".value";

                var binding = {
                    observe: modelFieldName,
                    onGet: "formatPeakUnitsLabel"
                };

                bindings[unitsLabelCssId] = binding;
            }, this);
        },

        formatPeakUnitsLabel: function(value, options)
        {
            return "Watts";
        },

        addTimeInZonesLabelStickitBindings: function(bindings, timeInZones)
        {
            _.each(timeInZones.timeInZones, function(timeInZone, index)
            {
                var cssId = "#timeInZone" + index;
                var unitsLabelCssId = cssId + "UnitsLabel";
                var modelFieldName = "timeIn" + this.metric + "Zones.timeInZones." + index;

                bindings[unitsLabelCssId] = {
                    observe: modelFieldName + ".seconds",
                    onGet: "formatPeakUnitsLabel"
                };

            }, this);

        },

        modifyPeaksChart: function(chartOptions, chartPoints)
        {
            _.extend(chartOptions, {
                yAxis: {
                    title: {
                        text: "WATTS"
                    }
                }
            });
        }

    };

    _.extend(powerViewBase, zonesViewBase);

    powerViewBase.chartColor = { light: "#8106C9", dark: "#590888" };

    return TP.ItemView.extend(powerViewBase);
});
