define(
[
    "TP",
    "controllers/pageContainerController",
    "layouts/dashboardLayout",
    "views/dashboard/dashboardHeader",
    "views/dashboard/dashboardLibrary",
    "views/dashboard/dashboardChartsContainer"
],
function(
    TP,
    PageContainerController,
    DashboardLayout,
    DashboardHeaderView,
    DashboardLibraryView,
    DashboardChartsContainerView
    )
{
    return PageContainerController.extend(
    {
        views: {},

        initialize: function()
        {
            this.layout = new DashboardLayout();
            this.layout.on("show", this.show, this);
            this.layout.on("close", this.onLayoutClose, this);

            // initialize the superclass
            this.constructor.__super__.initialize.call(this);
        },

        onLayoutClose: function()
        {
            _.each(this.views, function(view)
            {
                view.close();
            }, this);
        },

        /*
            VERY IMPORTANT :-)
            Create the views on show, not on initialize
            
            1) when you navigate between controllers, all of your view event bindings will be lost (via controller/view close) and you will be a very confused developer
            2) allows us to lazily initialize the controllers as needed
        */
        show: function()
        {
            if (this.layout.isClosed)
            {
                return;
            }

            this.createViews();
            this.displayViews();

            // wait for user to load ...
            this.setupUserFetchPromise();

            // our parent class PageContainerController needs this to trigger the window resize functionality
            this.trigger("show");
        },

        createViews: function()
        {
            this.views.dashboard = new DashboardChartsContainerView();
            this.views.header = new DashboardHeaderView();
            this.views.library = new DashboardLibraryView();
        },

        displayViews: function()
        {
            this.layout.dashboardRegion.show(this.views.dashboard);
            this.layout.libraryRegion.show(this.views.library);
            this.layout.headerRegion.show(this.views.header);
        },

        setupUserFetchPromise: function()
        {
            var self = this;
            theMarsApp.userFetchPromise.done(function()
            {
                _.each(self.views, function(view)
                {
                    view.trigger("user:loaded");
                }, self);

            });
        }

    });
});
