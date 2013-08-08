define(
[
    "underscore",
    "TP",
    "./dashboardChartSettingsBase"
],
function(
    _,
    TP,
    DashboardChartSettingsBase
    )
{
    var DashboardChartSettings = {

    };

    DashboardChartSettings = _.extend({}, DashboardChartSettingsBase, DashboardChartSettings);
    return TP.ItemView.extend(DashboardChartSettings);

});