define(
[
    "TP",
    "controllers/pageContainerController",
    "layouts/homeLayout",
    "views/home/homeHeader",
    "views/home/homeLibrary",
    "views/home/defaultHome",
    "views/home/coach/coachHome"
],
function(
    TP,
    PageContainerController,
    HomeLayout,
    HomeHeaderView,
    HomeLibraryView,
    DefaultHomeView,
    CoachHomeView
    )
{
    return PageContainerController.extend(
    {
        views: {},

        initialize: function()
        {
            this.layout = new HomeLayout();
            this.layout.on("show", this.show, this);

            // initialize the superclass
            this.constructor.__super__.initialize.call(this);
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
            this.views.defaultHome = new DefaultHomeView();
            this.views.coachHome = new CoachHomeView();
            this.views.header = new HomeHeaderView();
            this.views.library = new HomeLibraryView();
        },

        displayViews: function()
        {
            this.layout.homeRegion.show(this.views.defaultHome);
            this.layout.libraryRegion.show(this.views.library);
            this.layout.headerRegion.show(this.views.header);
        },

        setupUserFetchPromise: function()
        {
            var self = this;
            theMarsApp.userFetchPromise.done(function()
            {
                self.showCoachHomeOrRedirect();
                _.each(self.views, function(view)
                {
                    view.trigger("user:loaded");
                }, self);
            });
        },

        showCoachHomeOrRedirect: function()
        {
            if(theMarsApp.user.get("settings.account.isAthlete"))
            {
                theMarsApp.router.navigate("calendar", true);
            } else
            {
                this.layout.homeRegion.show(this.views.coachHome);
            }
        }

    });
});
