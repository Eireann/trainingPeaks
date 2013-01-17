define(
[
    "app",
    "backbone",
    "controllers/calendarController",
    "views/loginView",
    "models/session"
],
function (App, Backbone, CalendarController, LoginView, TheSession)
{
    var Router = Backbone.Router.extend(
    {
        initialize: function()
        {
            _.bindAll(this);
            App.on("api:unauthorized", this.login);
        },
        
        routes:
        {
            "home": "home",
            "calendar": "calendar"
        },

        home: function()
        {
            console.log("home");
        },
        
        calendar: function()
        {
            // Create Calendar Layout, Calendar controller, bind & display
            var controller = new CalendarController();
            App.appLayout.calendarRegion.show(controller.display());
        },
        
        login: function()
        {
            var view = new LoginView({ model: TheSession });
            App.appLayout.loginRegion.show(view);
        }
    });

    return Router;
});
