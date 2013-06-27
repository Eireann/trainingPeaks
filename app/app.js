define(
[
    "underscore",
    "TP",
    "framework/ajaxAuth",
    "framework/ajaxCaching",
    "framework/ajaxTimezone",
    "models/session",
    "models/userModel",
    "models/clientEventsCollection",
    "controllers/navigationController",
    "controllers/loginController",
    "controllers/calendar/calendarController",
    "controllers/dashboardController",
    "controllers/homeController",
    "router",
    "hbs!templates/views/notAllowedForAlpha",
    "marionette.faderegion",
    "jqueryui/tooltip"
],
function(
    _,
    TP,
    initializeAjaxAuth,
    ajaxCaching,
    initializeAjaxTimezone,
    Session,
    UserModel,
    ClientEventsCollection,
    NavigationController,
    LoginController,
    CalendarController,
    DashboardController,
    HomeController,
    Router,
    notAllowedForAlphaTemplate)
{

    var theApp = new TP.Application();
    theApp.ajaxCachingEnabled = false;
    theApp.historyEnabled = true;

    theApp.addAllShutdowns = function()
    {

        // close all of the controllers, which should close each of their corresponding layouts and views
        this.addShutdown(function()
        {
            _.each(_.keys(this.controllers), function(controllerName)
            {
                this.controllers[controllerName].close();
            }, this);
        });

        // cleanup session and user state

        // cleanup history?

        // done
        this.addShutdown(function()
        {
            this.started = false;
        });

    };

    theApp.resetAppToInitialState = function()
    {

        this.addAllShutdowns();

        this.addRegions(
        {
            navRegion: "#navigation",
            mainRegion: "#main"
        });

        // add logging first
        this.addInitializer(function()
        {
            this.logger = new TP.Logger();

            // in local environment, and not in test mode? set log level to debug
            if (!this.isLive() && typeof global === 'undefined')
            {
                this.logger.setLogLevel(this.logger.logLevels.DEBUG);
            }
            else
            {
                this.logger.setLogLevel(this.logger.logLevels.ERROR);
            }
        });

        this.addInitializer(function()
        {
            var self = this;
            window.onerror = function(errorMessage, url, lineNumber)
            {
                if (self.clientEvents)
                {
                    self.clientEvents.logEvent({ Event: { Type: "Error", Label: "UncaughtException", AppContext: url + " Error: " + errorMessage + " Line: " + lineNumber } });
                }
                return self.isLive() ? true : false;
            };
            
            $(document).ajaxError(function(event, xhr)
            {
                if (xhr.status === 400 || xhr.status === 500)
                {
                    if (self.clientEvents)
                    {
                        var responseText = xhr.responseText;
                        var status = xhr.status;
                        var statusText = xhr.statusText;

                        self.clientEvents.logEvent({ Event: { Type: "Error", Label: "AjaxError", AppContext: "ResponseText: " + responseText + ", Status: " + status + ", StatusText:" + statusText } });
                    }
                }
            });
        });

        // setup ajax auth and caching and timezone handling
        this.addInitializer(function()
        {
            initializeAjaxAuth(this);
            initializeAjaxTimezone();
            if(this.ajaxCachingEnabled)
                this.ajaxCaching = ajaxCaching.initialize(this);
        });
        
        // add a session
        this.addInitializer(function()
        {
            this.user = new UserModel();
            this.userFetchPromise = new $.Deferred();
            this.session = new Session();
            this.setupAuthPromise();
        });

        this.setupAuthPromise = function()
        {
            var self = this;
            this.session.authPromise.done(function()
            {
                self.fetchUser();
            });
            this.session.authPromise.fail(function()
            {
                self.setupAuthPromise();
            });
        };

        this.fetchUser = function()
        {
            var self = this;
            
            self.user.fetch().done(function()
            {
                if (self.featureAllowedForUser("alpha1", self.user))
                {
                    self.session.saveUserToLocalStorage(self.user);
                    self.fetchAthleteSettings();
                    self.userFetchPromise.resolve();
                }
                else
                    self.session.logout(notAllowedForAlphaTemplate);
            }).fail(function()
            {
                self.userFetchPromise.reject();
            });
        };

        this.featureAllowedForUser = function(feature, user)
        {
            if (!this.isLive())
            {
                return true;
            }

            switch (feature)
            {
                case "alpha1":
                    {
                        var userIsNotCoach = user.get("settings.account.isAthlete") && user.get("settings.account.coachType") === 0;
                        var userIsInAlphaACL = _.contains(user.get("settings.account.accessGroupIds"), 999999);
                        return userIsNotCoach && userIsInAlphaACL;
                    }
                    break;
                case "beta1":
                    return false;
            }
            throw "Feature does not exist";
        };

        this.fetchAthleteSettings = function()
        {
            this.user.getAthleteSettings().fetch();
        };

        // add event tracking
        this.addInitializer(function()
        {
            this.clientEvents = new ClientEventsCollection();
        });

        // add controllers
        this.addInitializer(function()
        {
            // Set up controllers container and eagerly load all the required Controllers.
            this.controllers = {};

            this.controllers.navigationController = new NavigationController();
            this.controllers.loginController = new LoginController();
            this.controllers.calendarController = new CalendarController();
            this.controllers.dashboardController = new DashboardController();
            this.controllers.homeController = new HomeController();
        });

        this.addInitializer(function()
        {
            if (this.historyEnabled)
            {
                this.history = Backbone.history;
            }
        });

        // add router
        this.addInitializer(function()
        {
            this.router = new Router();

            // history-less navigation for unit testing
            if(!this.historyEnabled)
            {
                this.router.navigate = function(routeName, trigger)
                {
                    if (this.routes.hasOwnProperty(routeName))
                    {
                        var methodName = this.routes[routeName];
                        this[methodName]();
                    }
                    if (trigger === true || (trigger && trigger.trigger))
                    {
                        this.trigger("route", routeName);
                    }
                };
            }
        });

        // show navigation
        this.addInitializer(function()
        {
            this.navRegion.show(this.controllers.navigationController.getLayout());
        });

        // Set up jQuery UI Tooltips
        this.addInitializer(function()
        {
            var tooltipPositioner = function(position, feedback)
            {

                var self = $(this);
                var targetElement = $(feedback.target.element);
                var cssLeftProperty = "left";
                position = targetElement.offset();

                // add an arrow
                if (self.find(".arrow").length === 0)
                {
                    var arrow = $("<div>").addClass("arrow");
                    self.append(arrow);
                    self.html(self.html().replace(/\n/g, "<br />"));
                    if (position.top <= ($(window).outerHeight() - 50))
                    {
                        self.addClass("below");

                    }
                    else
                    {
                        self.addClass("above");
                        cssLeftProperty = "margin-left";
                    }
                }

                // position it
                /*
                position.left -= (self.width() / 2);
                if (self.hasClass("above"))
                {
                    position.top -= (self.height() + 20);
                }
                */
                
                if (position.left > $(window).outerWidth() - 100)
                {
                    position.left = position.left + targetElement.outerWidth() - self.outerWidth();
                    self.find(".arrow").css(cssLeftProperty, self.outerWidth() - (targetElement.outerWidth() / 2) - 10);
                }
                else if (position.left < 100)
                {
                    self.find(".arrow").css(cssLeftProperty, (targetElement.outerWidth() / 2) - 10);
                }
                else
                {
                    position.left = position.left + (targetElement.outerWidth() / 2) - (self.outerWidth() / 2);
                }


                //position.left = position.left - (self.outerWidth() / 2);
                if (self.hasClass("above"))
                {
                    position.top -= self.outerHeight();
                } else
                {
                    position.top += targetElement.outerHeight();
                    //position.top += self.outerHeight();
                }

                self.css(position);
            };

            $(document).tooltip(
            {
                position:
                {
                    using: tooltipPositioner
                },

                show:
                {
                    delay: 500
                },

                track: false
            });
        });


        this.addInitializer(function()
        {
            var self = this;
            self.isBlurred = false;
            
            $(window).focus(function()
            {
                setTimeout(function()
                {
                    self.isBlurred = false;
                }, 1000);
            });

            $(window).blur(function()
            {
                self.isBlurred = true;
            });
        });

        this.addInitializer(function()
        {
            if (this.historyEnabled)
            {
                this.history.start({ pushState: false, root: this.root });
            }
        });

        this.addInitializer(function()
        {
            this.started = true;
        });

        this.isLive = function()
        {
            // if we're in local or dev mode, use DEBUG log level etc
            // but if we have a 'global', then we're testing with node/jasmine, so don't output debug messages to clutter test output
            if ((this.apiRoot.indexOf('local') >= 0 || this.apiRoot.indexOf('dev') >= 0))
                return false;

            return true;
        };

        this.getBodyElement = function()
        {
            if (!this.$body)
                this.$body = $("body");

            return this.$body;
        };

        this.reloadApp = function()
        {
            window.location.reload();
        };

        var wwwRoots =
        {
            live: "http://www.trainingpeaks.com",
            uat: "http://www.uat.trainingpeaks.com",
            dev: "http://www.dev.trainingpeaks.com",
            local: "http://localhost:8905",
            todd: "DEV20-T430:8901"
        };

        var apiRoots =
        {
            live: "https://tpapi.trainingpeaks.com",
            uat: "http://tpapi.uat.trainingpeaks.com",
            dev: "http://tpapi.dev.trainingpeaks.com",
            local: "http://localhost:8901",
            todd: "DEV20-T430:8901"
        };

        var oAuthRoots =
        {
            live: "https://oauth.trainingpeaks.com",
            uat: "http://oauth.uat.trainingpeaks.com",
            dev: "http://oauth.dev.trainingpeaks.com",
            local: "http://localhost:8900",
            todd: "DEV20-T430:8900"
        };

        // get environment name from index.html build target
        var apiRootName = window.hasOwnProperty('apiRoot') ? window.apiRoot : 'dev';

        // point to appropriate api server
        this.apiRoot = apiRoots[apiRootName];
        this.oAuthRoot = oAuthRoots[apiRootName];
        this.wwwRoot = wwwRoots[apiRootName];

        // app root for router and history
        if (apiRootName !== 'live')
        {
            this.root = "/Mars";
        }
        else
        {
            this.root = '';
        }

        // where to find assets dynamically
        this.assetsRoot = this.apiRootName === 'dev' ? 'build/debug/assets/' : 'assets/';

    };


    theApp.currentController = null;

    theApp.getCurrentController = function()
    {
        return this.currentController;
    };

    theApp.showController = function(controller)
    {
        if (controller !== this.currentController)
        {
            this.currentController = controller;
            this.mainRegion.show(controller.getLayout());
        }
    };


    theApp.resetAppToInitialState();
    window.theMarsApp = theApp;

    if (typeof global !== 'undefined')
    {
        global.theMarsApp = theApp;
    }

    return theApp;

});
