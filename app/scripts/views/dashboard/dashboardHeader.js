define(
[
    "TP",
    "hbs!templates/views/dashboard/dashboardHeader"
],
function(TP, dashboardHeaderTemplate)
{
    var DashboardHeaderView =
    {

        className: "frameworkHeaderView",

        template:
        {
            type: "handlebars",
            template: dashboardHeaderTemplate
        }
    };

    return TP.ItemView.extend(DashboardHeaderView);
});