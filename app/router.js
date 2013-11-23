define(
[
    "underscore",
    "TP",
    "utilities/rollbarManager"
],
function (_, TP, RollbarManager)
{
    var ensureUser = function(callback) 
    {
        return function()
        {
            var self = this;
            var args = Array.prototype.slice.call(arguments);
            var callbackWithArgs = function()
            {
                callback.apply(self, args);
            };
            theMarsApp.bootPromise.then(callbackWithArgs);
        };
    };

    return TP.Router.extend(
    {
        initialize: function ()
        {
            this.on("route", function(routeName)
            {
                var routeParts = routeName.split("/");
                this.currentRoute = routeParts[0];
                RollbarManager.setRoute(this.currentRoute);
            }, this);
        },

        getCurrentRoute: function()
        {
            return this.currentRoute;
        },

        routes:
        {
            "calendar": "calendar",
            "calendar/athletes/:athleteId": "calendar",
            "dashboard": "dashboard",
            "": "calendar"
        },

        calendar: ensureUser(function (athleteId)
        {
            
            if (athleteId)
                theMarsApp.user.setCurrentAthleteId(athleteId);

            if (theMarsApp.getCurrentController() === theMarsApp.controllers.calendarController)
                theMarsApp.controllers.calendarController.trigger("refresh");
            else
                theMarsApp.showController(theMarsApp.controllers.calendarController);

            TP.analytics("send", "pageview", { page: "calendar" });
        }),

        dashboard: ensureUser(function()
        {
            theMarsApp.showController(theMarsApp.controllers.dashboardController);

            TP.analytics("send", "pageview", { page: "dashboard" });
        })
    });
});
