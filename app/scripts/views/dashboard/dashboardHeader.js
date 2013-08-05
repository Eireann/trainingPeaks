define(
[
    "TP",
    "views/dashboard/chartUtils",
    "hbs!templates/views/dashboard/dashboardHeader"
],
function(TP, chartUtils, dashboardHeaderTemplate)
{
    var DashboardHeaderView =
    {

        className: "frameworkHeaderView",

        template:
        {
            type: "handlebars",
            template: dashboardHeaderTemplate
        },

        onRender: function()
        {
            self = this;
            setImmediate(function ()
            {
                self.$("#chartDateOptions").selectBoxIt({
                    dynamicPositioning: false
                });
            });
        },

        serializeData: function()
        {
            var chartSettings = chartUtils.buildChartParameters({});

            chartSettings.dateOptions = [];
            var selectedOptionId = Number(chartSettings.quickDateSelectOption);
            _.each(chartUtils.chartDateOptions, function (option)
            {
                chartSettings.dateOptions.push({
                    id: option.id,
                    label: option.label,
                    selected: option.id === selectedOptionId
                });
            });

            return chartSettings;
        }
    };

    return TP.ItemView.extend(DashboardHeaderView);
});