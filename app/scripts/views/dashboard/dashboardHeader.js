define(
[
    "TP",
    "hbs!templates/views/dashboard/dashboardHeader"
],
function(TP, dashboardHeaderTemplate)
{
    var DashboardHeaderView =
    {
        template:
        {
            type: "handlebars",
            template: dashboardHeaderTemplate
        }
    };

    return TP.ItemView.extend(DashboardHeaderView);
});