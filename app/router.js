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
            "home": "home",
            "login": "login",
            "calendar": "calendar",
            "": "calendar"  
        },

        home: function ()
        {
            var homeview = new TP.View();
            theMarsApp.mainRegion.show(homeview);
        },

        calendar: function ()
        {
            if (!theMarsApp.session.isAuthenticated())
            {
                theMarsApp.session.logout();
                return;
            }
            theMarsApp.mainRegion.show(theMarsApp.controllers.calendarController.getLayout());
        },

        login: function (origin)
        {
            theMarsApp.mainRegion.show(theMarsApp.controllers.loginController.getLayout());
        }

    });
});
