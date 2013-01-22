define(
[
    "underscore",
    "app",
    "backbone",
    "controllers/calendarController",
    "layouts/loginLayout",
    "views/loginView",
    "models/session"
],
function (_, theApp, Backbone, CalendarController, LoginLayout, LoginView, theSession)
{
    "use strict";

    return Backbone.Router.extend(
    {
        initialize: function ()
        {
            _.bindAll(this);
            
            theApp.on("api:unauthorized", this.login);
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
