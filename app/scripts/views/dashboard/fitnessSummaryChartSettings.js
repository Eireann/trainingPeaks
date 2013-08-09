define(
[
    "jqueryui/spinner",
    "underscore",
    "TP",
    "./dashboardChartSettingsBase",
    "hbs!templates/views/dashboard/fitnessSummaryChartSettings"
],
function(
    spinner,
    _,
    TP,
    DashboardChartSettingsBase,
    fitnessSummaryChartSettingsTemplate
    )
{
    var FitnessSummaryChartSettings = {

        className: DashboardChartSettingsBase.className + " fitnessSummaryChartSettings",

        template:
        {
            type: "handlebars",
            template: fitnessSummaryChartSettingsTemplate
        },

        events: _.extend({}, DashboardChartSettingsBase.events, {
            "change select.summaryType": "onSummaryTypeChanged"
        }),

        onSummaryTypeChange: function(e)
        {
            // get value
            // save to settings
            // render chart - chart needs to watch for events
        }

    };

    FitnessSummaryChartSettings = _.extend({}, DashboardChartSettingsBase, FitnessSummaryChartSettings);
    return TP.ItemView.extend(FitnessSummaryChartSettings);

});