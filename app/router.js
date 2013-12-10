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

    var athleteRoute = function(baseUrl, callback)
    {
        return ensureUser(function(athleteId)
        {
            // make sure current user can access requested athlete
            if (athleteId && !this._userCanAccessAthlete(athleteId)) {
                this.navigate(baseUrl, true);
                return;
            }

            // if user is coach, put athlete id in url
            if(this._userIsCoachWithAthletes() && !athleteId)
            {
                this.navigate(baseUrl + "/athletes/" + theMarsApp.user.getCurrentAthleteId(), {trigger: true, replace: true});
                return;
            }

            // if there is an athlete id, set the current athlete
            if(athleteId)
            {
                theMarsApp.user.setCurrentAthleteId(athleteId);
            }

            // call the route
            callback.apply(this, Array.prototype.slice.call(arguments));
        });
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

        calendar: athleteRoute("calendar", function (athleteId)
        {
            this._showController(theMarsApp.controllers.calendarController);
            TP.analytics("send", "pageview", { page: "calendar" });
        }),

        dashboard: athleteRoute("dashboard", function(athleteId)
        {
            this._showController(theMarsApp.controllers.dashboardController);
            TP.analytics("send", "pageview", { page: "dashboard" });
        }),

        _userCanAccessAthlete: function(athleteId, fallbackRoute)
        {
            athleteId = Number(athleteId);
            return theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.ViewAthleteCalendar, { athlete: { athleteId: athleteId }});
        },

        _showController: function(controller)
        {
            if (theMarsApp.getCurrentController() !== controller)
            {
                theMarsApp.showController(controller);
            }
        },

        _userIsCoachWithAthletes: function()
        {
            return !theMarsApp.user.getAccountSettings().get("isAthlete") && theMarsApp.user.has("athletes") && theMarsApp.user.get("athletes").length > 0;
        }

    });
});
