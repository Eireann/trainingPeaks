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
            "dashboard/athletes/:athleteId": "dashboard",
            "": "calendar"
        },

        calendar: ensureUser(function (athleteId)
        {
            if (athleteId) {
                this._setAthleteId(athleteId, "calendar"); 
            }

            this._showOrRefreshController(theMarsApp.controllers.calendarController);

            TP.analytics("send", "pageview", { page: "calendar" });
        }),

        dashboard: ensureUser(function(athleteId)
        {

            if (athleteId) {
                this._setAthleteId(athleteId, "calendar"); 
            }

            this._showOrRefreshController(theMarsApp.controllers.dashboardController);

            TP.analytics("send", "pageview", { page: "dashboard" });
        }),

        _setAthleteId: function(athleteId, fallbackRoute)
        {
            athleteId = Number(athleteId);
            if(theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.ViewAthleteCalendar, { athlete: { athleteId: athleteId }}))
            {
                theMarsApp.user.setCurrentAthleteId(athleteId);
            }
            else
            {
                theMarsApp.router.navigate(fallbackRoute, true);
            }
        },

        _showOrRefreshController: function(controller)
        {
            if (theMarsApp.getCurrentController() === controller)
            {
                controller.trigger("refresh");
            }
            else
            {
                theMarsApp.showController(controller);
            }
        }

    });
});
