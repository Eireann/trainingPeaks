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
    var speedViewBase = {
        metric: "Speed",
        zoneSettingName: "speedZones",
        graphTitle: "Speed",
        className: "quickViewSpeedTab",

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
                onGet: "formatSpeed",
                onSet: "parseSpeed",
                workoutTypeValueId: this.workoutModel.get("workoutTypeValueId")
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
                    onGet: "formatPeakUnitsLabel",
                    workoutTypeValueId: this.workoutModel.get("workoutTypeValueId")
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
                    onGet: "formatPeakUnitsLabel",
                    workoutTypeValueId: this.workoutModel.get("workoutTypeValueId")
                };

                bindings[minimumCssId] = {
                    observe: modelFieldName + ".minimum",
                    onGet: "formatSpeed",
                    defaultValue: "0.00",
                    workoutTypeValueId: this.workoutModel.get("workoutTypeValueId")
                };

                bindings[maximumCssId] = {
                    observe: modelFieldName + ".maximum",
                    onGet: "formatSpeed",
                    defaultValue: "0.00",
                    workoutTypeValueId: this.workoutModel.get("workoutTypeValueId")
                };

            }, this);

        },
        
        formatPeakUnitsLabel: function (value, options)
        {
            return TP.utils.units.getUnitsLabel("speed", this.workoutModel.get("workoutTypeValueId"));
        },

        formatSpeed: function(value, options)
        {
            return this.formatUnitsValue("speed", value, options);
        },

        parseSpeed: function(value, options)
        {
            return this.formatUnitsValue("speed", value, options);
        },
        
        formatDurationFromSeconds: function(value, options)
        {
            return this.formatUnitsValue("seconds", value, options);
        },

        parseDurationAsSeconds: function(value, options)
        {
            return this.parseUnitsValue("seconds", value, options);
        }
    };

    _.extend(speedViewBase, zonesViewBase);

    speedViewBase.chartColor = { light: "#0E7FCF", dark: "#0B568D" };

    return TP.ItemView.extend(speedViewBase);
});
