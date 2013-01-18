define(
[
    "app",
    "backbone",
    
    "controllers/calendarController",
    
    "layouts/loginLayout",
    "views/loginView",
    "models/session"
],
function (theApp, Backbone, CalendarController, LoginLayout, LoginView, theSession)
{
    "use strict";
    
    return Backbone.Router.extend(
    {
        initialize: function()
        {
            _.bindAll(this);
            theApp.on("api:unauthorized", this.login);
        },
        
        routes:
        {
            "home": "home",
            "login": "login",
            "calendar": "calendar",
        },

        home: function()
        {
            console.log("home");
        },
        
        calendar: function()
        {
            // Create Calendar Layout, Calendar controller, bind & display
            var controller = new CalendarController();
            theApp.mainRegion.show(controller.layout);
            controller.show();
        },
        
        login: function(origin)
        {
            var self = this;
            
            var loginLayout = new LoginLayout();
            var loginView = new LoginView({ model: theSession });

            theSession.on("api:authorized", function()
            {
                self.navigate("calendar", { trigger: true } );
            });

            theApp.mainRegion.show(loginLayout);
            loginLayout.mainRegion.show(loginView);
        }
    });
});
