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
            this.on("buildPeakStickitBinding", this.addFormattersToPeakStickitBinding, this);
            this.on("buildTimeInZoneStickitBinding", this.addFormattersToTimeInZoneStickitBinding, this);
        },

        addFormattersToPeakStickitBinding: function (binding, peak)
        {
            _.extend(binding,
            {
                onGet: "formatHeartRate",
                onSet: "parseHeartRate"
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

        formatHeartRate: function(value, options)
        {
            return this.formatUnitsValue("heartrate", value, options);
        },

        parseHeartRate: function(value, options)
        {
            return this.parseUnitsValue("heartrate", value, options);
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

    _.extend(hrViewBase, zonesViewBase);

    return TP.ItemView.extend(hrViewBase);
});
