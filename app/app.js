define(
[
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
    "router",
    "marionette.faderegion",
    "jqueryui/tooltip"
],
function(
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
    Router)
{

    var theApp = new TP.Application();
    theApp.ajaxCachingEnabled = false;

    theApp.resetAppToInitialState = function()
    {
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
            if (!this.isLive())
            {
                this.logger.setLogLevel(this.logger.logLevels.DEBUG);
            }
            else
            {
                this.logger.setLogLevel(this.logger.logLevels.ERROR);
            }
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

            var storedUser = this.session.getUserFromLocalStorage();
            if (storedUser && storedUser.get("athletes.0.athleteId"))
            {
                self.user.set(storedUser.attributes);
                self.fetchAthleteSettings();
                self.userFetchPromise.resolve();
            } else
            {
                self.user.fetch().done(function()
                {
                    self.session.saveUserToLocalStorage(self.user);
                    self.fetchAthleteSettings();
                    self.userFetchPromise.resolve();
                }).fail(function()
                {
                    self.userFetchPromise.reject();
                });
            }
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

            this.router = new Router();
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
                
                if(targetElement.outerWidth() > 200)
                {
                    //position.left;
                }
                else if (position.left > $(window).outerWidth() - 100)
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
        
        this.isLive = function()
        {
            // if we're in local or dev mode, use DEBUG log level etc
            // but if we have a 'global', then we're testing with node/jasmine, so don't output debug messages to clutter test output
            if ((this.apiRoot.indexOf('local') > 0 || this.apiRoot.indexOf('dev') > 0) && typeof global === 'undefined')
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
        this.wwwRoot = "http://www.trainingpeaks.com";

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


    theApp.resetAppToInitialState();
    window.theMarsApp = theApp;

    if (typeof global !== 'undefined')
    {
        global.theMarsApp = theApp;
    }

    return theApp;

});
