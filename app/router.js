define(
[
    "underscore",
    "TP",
    "utilities/rollbarManager",
    "shared/views/waitMessageView",
    "views/userConfirmationView"
],
function (
          _,
          TP,
          RollbarManager,
          WaitMessageView,
          UserConfirmationView
          )
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
            var self = this;

            // make sure current user can access requested athlete
            if (athleteId && !this._userCanAccessAthlete(athleteId)) {
                this.navigate(baseUrl, true);
                return;
            }

            // if user is coach, and no athleteId value was passed, put current athlete id in url
            if(!athleteId && theMarsApp.user.isCoach())
            {
                var defaultAthleteId = theMarsApp.athleteManager.getDefaultAthleteId();

                if(defaultAthleteId)
                {
                    loadAthlete(defaultAthleteId).done(function()
                    {
                        self.navigate(baseUrl + "/athletes/" + theMarsApp.user.getCurrentAthleteId(), {trigger: true, replace: true});
                    });
                }
                else
                {
                    new UserConfirmationView({ message: "This coach account does not have any clients" }).render();
                }
                return;
            }

            // if there is an athlete id, set the current athlete
            if(athleteId)
            {
                athleteId = parseInt(athleteId, 10);
                var args = Array.prototype.slice.call(arguments);
                loadAthlete(athleteId).done(function()
                {
                    callback.apply(self, args);
                }).fail(function()
                {
                    // TODO: how to handle api failures
                });
            }
            else
            {
                // call the route
                callback.apply(this, arguments);
            }

        });
    };  

    var loadAthlete = function(athleteId)
    {
        var waitMessage = new WaitMessageView({ model: new TP.Model({ message: TP.utils.translate("Loading athlete data")})}).render();
        return theMarsApp.athleteManager.loadAthlete(athleteId).done(function()
        {
            waitMessage.close();
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
        }

    });
});
