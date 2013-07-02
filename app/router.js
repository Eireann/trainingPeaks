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
        },

        home: function ()
        {
            this.checkAuth();
            theMarsApp.showController(theMarsApp.controllers.homeController);
        },

        calendar: function (athleteId)
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
        },

        dashboard: function()
        {
            this.checkAuth();
            theMarsApp.showController(theMarsApp.controllers.dashboardController);
        },
        
        tools: function()
        {
            this.checkAuth();

            var toolsView = new TP.ItemView(
            {
                template:
                {
                    type: "handlebars",
                    template: function ()
                    {
                        var top = $(document).height() / 2;
                        var left = $(document).width() / 2 - 50;

                        return "<div style='font-size:24px;position: absolute; top:" + top.toFixed(0) + "px; left:" + left.toFixed(0) + "px;'>Tools</div>";
                    }
                }
            });
            theMarsApp.mainRegion.show(toolsView);
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
