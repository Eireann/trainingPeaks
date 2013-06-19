define(
[
    "TP",
    "hbs!templates/views/dashboard/dashboardCharts"
],
function(TP, dashboardTemplate)
{
    var DashboardView =
    {
        template:
        {
            type: "handlebars",
            template: dashboardTemplate
        }
    };

    return TP.ItemView.extend(DashboardView);
});