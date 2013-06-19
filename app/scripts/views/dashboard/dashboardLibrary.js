define(
[
    "TP",
    "hbs!templates/views/dashboard/dashboardLibrary"
],
function(TP, dashboardLibraryTemplate)
{
    var DashboardLibraryView =
    {
        template:
        {
            type: "handlebars",
            template: dashboardLibraryTemplate
        }
    };

    return TP.ItemView.extend(DashboardLibraryView);
});