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
        }

    };

    _.extend(hrViewBase, zonesViewBase);

    return TP.ItemView.extend(hrViewBase);
});
