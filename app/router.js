define(
[
    "underscore",
    "TP"
],
function (_, TP)
{
    return TP.Router.extend(
    {
        initialize: function ()
        {

            theMarsApp.navRegion.show(theMarsApp.controllers.navigationController.getLayout());

            var self = this;

            theMarsApp.on("api:unauthorized", function()
            {
                self.navigate("login", { trigger: true });
            });

            theMarsApp.controllers.loginController.on("login:success", function()
            {
                self.navigate("calendar", { trigger: true });
            });

            this.on("route", function(routeName)
            {
                this.currentRoute = routeName;
            }, this);
        },

        getCurrentRoute: function()
        {
            return this.currentRoute;
        },

        routes:
        {
            "login": "login",
            "home": "home",
            "calendar": "calendar",
            "dashboard": "dashboard",
            "tools": "tools",
            "": "calendar"  
        },

        login: function ()
        {
            theMarsApp.mainRegion.show(theMarsApp.controllers.loginController.getLayout());
        },

        home: function ()
        {
            if (!theMarsApp.session.isAuthenticated())
            {
                theMarsApp.session.logout();
                return;
            }
            
            var homeview = new TP.View();
            theMarsApp.mainRegion.show(homeview);
        },

        calendar: function ()
        {
            this.checkAuth();

            theMarsApp.mainRegion.show(theMarsApp.controllers.calendarController.getLayout());
        },

        dashboard: function()
        {
            this.checkAuth();

            var dashboardView = new TP.View();
            theMarsApp.mainRegion.show(dashboardView);
        },
        
        tools: function()
        {
            this.checkAuth();

            var dashboardView = new TP.View();
            theMarsApp.mainRegion.show(dashboardView);
        },
        
        checkAuth: function()
        {
            if (!theMarsApp.session.isAuthenticated())
            {
                theMarsApp.session.logout();
                return;
            }
        }        
    });
});
