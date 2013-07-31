define(
[
    "underscore",
    "TP"
],
function (_, TP)
{

    var ensureUser = function(callback) 
    {
        return function()
        {
            var self = this;
            var args = arguments;
            theMarsApp.userFetchPromise.done(function()
            {
                callback.apply(self, args);
            });
        };
    };

    return TP.Router.extend(
    {
        initialize: function ()
        {

            var self = this;

            theMarsApp.on("api:unauthorized", function()
            {
                self.navigate("login", { trigger: true });
            });

            theMarsApp.controllers.loginController.on("login:success", function()
            {
                self.navigate("home", { trigger: true });
            });

            this.on("route", function(routeName)
            {
                var routeParts = routeName.split("/");
                this.currentRoute = routeParts[0];
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
            "calendar/athletes/:athleteId": "calendar",
            "dashboard": "dashboard",
            "tools": "tools",
            "": "calendar"
        },

        login: function ()
        {
            theMarsApp.showController(theMarsApp.controllers.loginController);

            TP.analytics("send", "pageview", { page: "login" });
        },

        home: function ()
        {
            this.checkAuth();
            theMarsApp.showController(theMarsApp.controllers.homeController);

            TP.analytics("send", "pageview", { page: "home" });
        },

        calendar: ensureUser(function (athleteId)
        {

            if (athleteId)
            {
                theMarsApp.user.setCurrentAthleteId(athleteId);
            }

            this.checkAuth();

            if (theMarsApp.getCurrentController() === theMarsApp.controllers.calendarController)
            {
                theMarsApp.controllers.calendarController.trigger("refresh");
            } else
            {
                theMarsApp.showController(theMarsApp.controllers.calendarController);
            }

            TP.analytics("send", "pageview", { page: "calendar" });
        }),

        dashboard: function()
        {
            this.checkAuth();
            theMarsApp.showController(theMarsApp.controllers.dashboardController);

            TP.analytics("send", "pageview", { page: "dashboard" });
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
