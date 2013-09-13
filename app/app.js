define(
[
    "underscore",
    "TP",
    "framework/ajaxAuth",
    "framework/ajaxCaching",
    "framework/ajaxTimezone",
    "framework/tooltips",
    "framework/dataManager",
    "dashboard/reportingDataManager",
    "models/session",
    "shared/models/userModel",
    "shared/models/userAccessRightsModel",
    "models/buildInfo",
    "models/timeZones",
    "models/clientEventsCollection",
    "controllers/navigationController",
    "controllers/loginController",
    "controllers/calendar/calendarController",
    "controllers/dashboardController",
    "views/buildInfoView",
    "router",
    "utilities/dragAndDropFileUploadWidget",
    "utilities/textFieldNumberFilter",
    "shared/utilities/featureAuthorization/featureAuthorizer",
    "hbs!templates/views/notAllowedForAlpha",
    "scripts/plugins/marionette.faderegion"
],
function(
    _,
    TP,
    initializeAjaxAuth,
    ajaxCaching,
    initializeAjaxTimezone,
    enableTooltips,
    DataManager,
    ReportingDataManager,
    Session,
    UserModel,
    UserAccessRightsModel,
    BuildInfoModel,
    TimeZonesModel,
    ClientEventsCollection,
    NavigationController,
    LoginController,
    CalendarController,
    DashboardController,
    BuildInfoView,
    Router,
    DragAndDropFileUploadWidget,
    TextFieldNumberFilter,
    FeatureAuthorizer,
    notAllowedForAlphaTemplate,
    fadeRegion)
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

        this.user = new UserModel();
        this.userAccessRights = new UserAccessRightsModel();
        this.session = new Session();
        this.addAllShutdowns();

        this.addRegions(
        {
            navRegion: "#navigation",
            mainRegion: "#main",
            infoRegion: "#info"
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
            /*
            window.onerror = function(errorMessage, url, lineNumber)
            {
                if (self.clientEvents)
                {
                    self.clientEvents.logEvent({ Event: { Type: "Error", Label: "UncaughtException", AppContext: url + " Error: " + errorMessage + " Line: " + lineNumber } });
                }
                return self.isLive() ? true : false;
            };
            */
            
            $(document).ajaxError(function(event, xhr)
            {
                if (xhr.status === 400 || xhr.status === 500)
                {
                    try
                    {
                        console.log("XHR ERROR");
                        if(Raven)
                            Raven.captureException({event: event, xhr: xhr});
                        else if(_rollbar)
                            _rollbar.push({ event: event, xhr: xhr });
                    }
                    catch(e)
                    {/* IGNORE - we are only trying to report an exception, if reporting doesn't work, we don't care */}
                }
            });
        });

        // setup ajax auth and caching and timezone handling
        this.addInitializer(function()
        {
            initializeAjaxAuth(this);
            initializeAjaxTimezone();
            if (this.ajaxCachingEnabled)
                this.ajaxCaching = ajaxCaching.initialize();
        });
        
        // display build info
        this.addInitializer(function()
        {
            this.buildInfo = new BuildInfoModel(
                {
                    marsVersion: this.apiConfig.buildNumber
                }
            );

            if(!this.isLive())
            {
                var buildInfoView = new BuildInfoView({ model: this.buildInfo });
                this.infoRegion.show(buildInfoView);
            }

        });

        // setup time zones
        this.addInitializer(function()
        {
            this.timeZones = new TimeZonesModel();
        });

        // add a session
        this.addInitializer(function()
        {
            this.user = new UserModel();
            this.userFetchPromise = new $.Deferred();
            this.session = new Session();
            this.setupAuthPromise();
        });

        // add data managers
        this.addInitializer(function()
        {
            // reset reporting manager when we save or delete workouts
            var dataManagerOptions = { resetPatterns: [/athletes\/[0-9]+\/workouts/] };
            this.dataManagers = {
                reporting: new ReportingDataManager(dataManagerOptions),
                calendar: new DataManager(dataManagerOptions)
            };

            this.on("save:model destroy:model", function(model)
            {
                var modelUrl = _.result(model, "url");
                _.each(this.dataManagers, function(dataManager)
                {
                    dataManager.reset(modelUrl);
                });

            }, this);
        });

        // add feature authorizer
        this.addInitializer(function()
        {
            this.featureAuthorizer = new FeatureAuthorizer(this.user, this.userAccessRights);
            this.on("api:paymentrequired", function()
            {
                this.featureAuthorizer.showUpgradeMessage();
            }, this);
        });

        this.setupAuthPromise = function()
        {
            var self = this;
            this.session.authPromise.done(function()
            {
                self.fetchUser();
                self.fetchBuildInfo();
                self.fetchTimeZones();
            });
            this.session.authPromise.fail(function()
            {
                self.setupAuthPromise();
            });
        };

        this.fetchBuildInfo = function()
        {
            this.buildInfo.fetch();
        };

        this.fetchTimeZones = function()
        {
            this.timeZones.fetch();
        };

        this.fetchUser = function()
        {
            var self = this;
          
            // fetch user and access rights in parallel ,
            // but fetch athlete settings later because they depend on user
            $.when(
                self.user.fetch(),
                self.fetchUserAccessRights()
            ).done(function()
            {
                if (self.featureAllowedForUser("alpha1", self.user))
                {
                    self.session.saveUserToLocalStorage(self.user);

                    self.fetchAthleteSettings().done(
                        function()
                        {
                            self.userFetchPromise.resolve();
                        }
                    ).fail(
                        function()
                        {
                            self.userFetchPromise.reject();
                        }
                    );
                }
                else
                {
                    self.session.logout(notAllowedForAlphaTemplate);
                }
            }).fail(function()
            {
                self.userFetchPromise.reject();
            });
        };

        this.fetchUserAccessRights = function()
        {
            return this.userAccessRights.fetch();
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
                        //var userIsNotCoach = user.getAccountSettings().get("isAthlete") && user.getAccountSettings().get("coachType") === 0;
                        var userIsInAlphaACL = _.contains(user.getAccountSettings().get("accessGroupIds"), 999999);
                        //return userIsNotCoach && userIsInAlphaACL;
                        return userIsInAlphaACL;
                    }
                    break;
                case "beta1":
                    return false;
            }
            throw new Error("Feature does not exist");
        };

        this.fetchAthleteSettings = function()
        {
            return this.user.getAthleteSettings().fetch();
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
            this.controllers.calendarController = new CalendarController({ dataManager: this.dataManagers.calendar });
            this.controllers.dashboardController = new DashboardController({ dataManager: this.dataManagers.reporting });
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
            enableTooltips();
        });

        // Set up touch events
        this.addInitializer(function()
        {
            this.watchForFirstTouch();
        });

        // setup app blur/focus
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
                this.history.start({ pushState: false, root: this.root });
        });

        this.addInitializer(function()
        {
            DragAndDropFileUploadWidget.initialize(this.getBodyElement(), this.getBodyElement().find("#messages"));
        });

        this.addInitializer(function()
        {
            this.started = true;
        });

        this.addInitializer(function ()
        {
            $(document).on("keypress.filterNumberInput", ".numberInput", this.filterfunction);
        });

        this.filterfunction = function (evt)
        {
            TextFieldNumberFilter.isNumberKey(evt);
        };

        
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

        // simple dummy values for testing
        if (typeof apiConfig === "undefined")
        {
            apiConfig = {
                configuration: 'debug',
                apiRoot: 'localhost:8905',
                oAuthRoot: 'localhost:8901',
                wwwRoot: 'localhost',
                buildNumber: "local_no_config",
                gaAccount: "",
                coachUpgradeURL: "",
                upgradeURL:""
            };

            window.apiConfig = apiConfig;
        }

        // point to appropriate api server
        this.apiRoot = apiConfig.apiRoot;
        this.oAuthRoot = apiConfig.oAuthRoot;
        this.wwwRoot = apiConfig.wwwRoot;

        // app root for router and history
        this.root = '';

        // where to find assets dynamically
        this.assetsRoot = apiConfig.assetsRoot ? apiConfig.assetsRoot : 'assets/';

        // make apiConfig available
        this.apiConfig = apiConfig;
    };

    theApp.touchEnabled = false;

    theApp.isTouchEnabled = function()
    {
        return this.touchEnabled;
    };

    theApp.enableTouch = function()
    {
        this.getBodyElement().addClass("touchEnabled");
        // no zoom for touch devices because it seems to break click/hover coordinates
        $("meta[name=viewport]").attr("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
        this.touchEnabled = true;
    };

    theApp.watchForFirstTouch = function()
    {
        var self = this;
        this.getBodyElement().one("touchstart", function()
        {
            self.enableTouch();
        });
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
