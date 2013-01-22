define(
[
    "underscore",
    "app",
    "backbone",
    "controllers/navigationController",
    "controllers/calendarController",
    "layouts/loginLayout",
    "views/loginView",
    "models/session"
],
function (_, theApp, Backbone, NavigationController, CalendarController, LoginLayout, LoginView, theSession)
{
    "use strict";

    return Backbone.Router.extend(
    {
        controllers: {},
        
        initialize: function ()
        {
            _.bindAll(this);
            
            theApp.on("api:unauthorized", this.login);

            this.controllers.navigationController = new NavigationController();
            theApp.navRegion.show(this.controllers.navigationController.layout);
            this.controllers.navigationController.show();
        },

        routes:
        {
            "home": "home",
            "login": "login",
            "calendar": "calendar",
            "": "calendar"  
        },

        home: function ()
        {
        },

        calendar: function ()
        {
            // Create Calendar Layout, Calendar controller, bind & display
            var controller = new CalendarController();
            theApp.mainRegion.show(controller.layout);
            controller.show();
        },

        login: function (origin)
        {
            var self = this;

            var loginLayout = new LoginLayout();
            var loginView = new LoginView({ model: theSession });
            
            loginView.on("login:success", function ()
            {
                self.navigate("calendar", { trigger: true });
            });

            theApp.mainRegion.show(loginLayout);
            loginLayout.mainRegion.show(loginView);
        }
    });
});
