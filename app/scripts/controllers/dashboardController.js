define(
[
    "TP",
    "controllers/pageContainerController",
    "layouts/dashboardLayout",
    "views/dashboard/dashboardHeader",
    "views/dashboard/dashboardLibrary",
    "views/dashboard/dashboardCharts"
],
function(
    TP,
    PageContainerController,
    DashboardLayout,
    DashboardHeaderView,
    DashboardLibraryView,
    DashboardChartsView
    )
{
    return PageContainerController.extend(
    {
        views: {},

        initialize: function()
        {
            this.layout = new DashboardLayout();
            this.layout.on("show", this.show, this);

            this.constructor.__super__.initialize.call(this);
        },

        show: function()
        {
            if (this.layout.isClosed)
            {
                return;
            }

            this.views.dashboard = new DashboardChartsView();
            this.views.header = new DashboardHeaderView();
            this.views.library = new DashboardLibraryView();

            this.layout.dashboardRegion.show(this.views.dashboard);
            this.layout.libraryRegion.show(this.views.library);
            this.layout.headerRegion.show(this.views.header);

            this.trigger("show");
        }
    });
});
