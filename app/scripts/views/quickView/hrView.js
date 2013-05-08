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
        graphTitle: "Heart Rate",
        className: "quickViewHrTab"
    };

    _.extend(hrViewBase, zonesViewBase);
    return TP.ItemView.extend(hrViewBase);
});
