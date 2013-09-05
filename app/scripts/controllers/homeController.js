﻿define(
[
    "TP",
    "layouts/homeLayout",
    "views/home/defaultHome",
    "controllers/coachHomeController",
    "controllers/athleteHomeController"
],
function(
    TP,
    HomeLayout,
    DefaultHomeView,
    CoachHomeController,
    AthleteHomeController
    )
{
    return TP.Controller.extend(
    {
        views: {},

        initialize: function()
        {
            this.layout = new HomeLayout();
            this.layout.on("show", this.show, this);
            this.layout.on("close", this.onLayoutClose, this);
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
        },

        createViews: function()
        {
            this.views.defaultHome = new DefaultHomeView();
            this.views.athleteHome = new AthleteHomeController();
            this.views.coachHome = new CoachHomeController();
        },

        displayViews: function()
        {
            this.layout.homeRegion.show(this.views.defaultHome);
        },

        setupUserFetchPromise: function()
        {
            var self = this;
            theMarsApp.userFetchPromise.done(function()
            {
                self.showCoachHomeOrAthleteHome();
            });
        },

        showCoachHomeOrAthleteHome: function()
        {
            if(theMarsApp.user.getAccountSettings().get("isAthlete"))
            {
                this.layout.homeRegion.show(this.views.athleteHome.getLayout());
            } else
            {
                this.layout.homeRegion.show(this.views.coachHome.getLayout());
            }
        }

    });
});
