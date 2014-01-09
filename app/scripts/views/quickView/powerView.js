define(
[
    "underscore",
    "TP",
    "views/quickView/qvZonesTabs/baseView"
],
function(_, TP, zonesViewBase)
{
    var powerViewBase =
    {
        metric: "Power",
        zoneSettingName: "powerZones",
        graphTitle: "Power",
        className: "quickViewPowerTab",

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
            _.extend(binding, {
                onGet: "formatPower",
                onSet: "parsePower"
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
                var modelFieldName = "timeIn" + this.metric + "Zones.timeInZones." + index;

                bindings[unitsLabelCssId] =
                {
                    observe: modelFieldName + ".seconds",
                    onGet: "formatPeakUnitsLabel"
                };

            }, this);

        },
        
        formatPeakUnitsLabel: function (value, options)
        {
            return "Watts";
        },
        
        formatDurationFromSeconds: function(value, options)
        {
            return this.formatUnitsValue("seconds", value, options);
        },

        parseDurationAsSeconds: function(value, options)
        {
            return this.parseUnitsValue("seconds", value, options);
        },

        formatPower: function(value, options)
        {
            return this.formatUnitsValue("power", value, options);
        },

        parsePower: function(value, options)
        {
            return this.formatUnitsValue("power", value, options);
        }
    };

    _.extend(powerViewBase, zonesViewBase);

    powerViewBase.chartColor = { light: "#8106C9", dark: "#590888" };

    return TP.ItemView.extend(powerViewBase);
});
