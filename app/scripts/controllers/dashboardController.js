define(
[
    "TP",
    "layouts/dashboardLayout",
    "views/dashboard/dashboardHeader",
    "views/dashboard/dashboardLibrary",
    "views/dashboard/dashboardCharts"
],
function(
    TP,
    DashboardLayout,
    DashboardHeaderView,
    DashboardLibraryView,
    DashboardChartsView
    )
{
    return TP.Controller.extend(
    {
        views: {},

        initialize: function()
        {
            this.layout = new DashboardLayout();
            this.layout.on("show", this.show, this);

            this.views.dashboard = new DashboardChartsView();
            this.views.header = new DashboardHeaderView();
            this.views.library = new DashboardLibraryView();
        },

        show: function()
        {
            if (this.layout.isClosed)
            {
                return;
            }

            this.layout.dashboardRegion.show(this.views.dashboard);
            this.layout.libraryRegion.show(this.views.library);
            this.layout.headerRegion.show(this.views.header);
        },

        onClose: function()
        {
            this.layout.off("show", this.show, this);
            this.layout.close();
            this.views.dashboard.close();
        }
    });
});
