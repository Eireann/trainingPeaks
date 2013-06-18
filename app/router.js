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
            
            var homeview = new TP.ItemView(
            {
                template:
                {
                    type: "handlebars",
                    template: function()
                    {
                        var top = $(document).height() / 2;
                        var left = $(document).width() / 2 - 50;
                        
                        return "<div style='font-size:24px;position: absolute; top:" + top.toFixed(0) + "px; left:" + left.toFixed(0) + "px;'>Home</div>";
                    }
                }
            });
            
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

            var dashboardView = new TP.ItemView(
            {
                template:
                {
                    type: "handlebars",
                    template: function ()
                    {
                        var top = $(document).height() / 2;
                        var left = $(document).width() / 2 - 70;

                        return "<div style='font-size:24px;position: absolute; top:" + top.toFixed(0) + "px; left:" + left.toFixed(0) + "px;'>Dashboard</div>";
                    }
                }
            });
            theMarsApp.mainRegion.show(dashboardView);
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
