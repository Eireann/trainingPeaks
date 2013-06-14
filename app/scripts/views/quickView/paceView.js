﻿define(
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
    var paceViewBase = {
        metric: "Speed",
        zoneSettingName: "speedZones",
        graphTitle: "Pace",
        className: "quickViewPaceTab",

        initialize: function(options)
        {
            this.initializeBaseView(options);
            this.on("buildPeakStickitBinding", this.addFormattersToPeakStickitBinding, this);
            this.on("buildTimeInZoneStickitBinding", this.addFormattersToTimeInZoneStickitBinding, this);
            this.on("additionalPeaksStickitBindings", this.addPeaksLabelStickitBindings, this);
            this.on("additionalTimeInZonesStickitBindings", this.addTimeInZonesLabelStickitBindings, this);
        },

        addFormattersToPeakStickitBinding: function(binding, peak)
        {
            _.extend(binding,
            {
                onGet: "formatPace",
                onSet: "parsePace"
            });
        },

        addFormattersToTimeInZoneStickitBinding: function(binding, timeInZone)
        {
            _.extend(binding,
            {
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

                var binding =
                {
                    observe: modelFieldName,
                    onGet: "formatPeakUnitsLabel"
                };

                bindings[unitsLabelCssId] = binding;
            }, this);
        },

        addTimeInZonesLabelStickitBindings: function(bindings, timeInZones)
        {
            _.each(timeInZones.timeInZones, function(timeInZone, index)
            {
                var cssId = "#timeInZone" + index;
                var unitsLabelCssId = cssId + "UnitsLabel";
                var minimumCssId = cssId + "Minimum";
                var maximumCssId = cssId + "Maximum";
                var modelFieldName = "timeIn" + this.metric + "Zones.timeInZones." + index;

                bindings[unitsLabelCssId] = {
                    observe: modelFieldName + ".seconds",
                    onGet: "formatPeakUnitsLabel"
                };

                bindings[minimumCssId] = {
                    observe: modelFieldName + ".minimum",
                    onGet: "formatPace"
                };

                bindings[maximumCssId] = {
                    observe: modelFieldName + ".maximum",
                    onGet: "formatPace"
                };

            }, this);

        },
        
        formatPeakUnitsLabel: function (value, options)
        {
            return "min/" + TP.utils.units.getUnitsLabel("distance", this.workoutType);
        }
    };

    _.extend(paceViewBase, zonesViewBase);

    paceViewBase.chartColor = { light: "#0E7FCF", dark: "#0B568D" };

    return TP.ItemView.extend(paceViewBase);
});
