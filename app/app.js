define(
[
    "underscore",
    "TP",
    "framework/ajaxCaching",
    "framework/ajaxTimezone",
    "framework/ajax402",
    "framework/tooltips",
    "framework/identityMap",
    "framework/dataManager",
    "shared/models/calendarManager",
    "shared/models/selectionManager",
    "models/session",
    "models/buildInfo",
    "models/timeZones",
    "models/clientEventsCollection",
    "controllers/navigationController",
    "controllers/calendar/calendarController",
    "controllers/dashboardController",
    "controllers/homeController",
    "views/buildInfoView",
    "router",
    "utilities/dragAndDropFileUploadWidget",
    "utilities/textFieldNumberFilter",
    "utilities/rollbarManager",
    "shared/utilities/featureAuthorization/featureAuthorizer",
    "hbs!templates/views/notAllowedForAlpha",
    "scripts/plugins/marionette.faderegion"
],
function(
    _,
    TP,
    ajaxCaching,
    initializeAjaxTimezone,
    initializeAjax402,
    ToolTips,
    IdentityMap,
    DataManager,
    CalendarManager,
    SelectionManager,
    Session,
    BuildInfoModel,
    TimeZonesModel,
    ClientEventsCollection,
    NavigationController,
    CalendarController,
    DashboardController,
    HomeController,
    BuildInfoView,
    Router,
    DragAndDropFileUploadWidget,
    TextFieldNumberFilter,
    RollbarManager,
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

        // done
        this.addShutdown(function()
        {
            this.started = false;
        });
    };

    theApp.setApiConfig = function()
    {
        // simple dummy values for testing
        if (typeof apiConfig === "undefined" || typeof window.apiConfig === "undefined")
        {
            apiConfig =
            {
                configuration: 'debug',
                apiRoot: 'localhost:8905',
                oAuthRoot: 'localhost:8901',
                homeRoot: "localhost:8905",
                cmsRoot: "localhost:8905",
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
        this.root = "";

        // where to find assets dynamically
        this.assetsRoot = apiConfig.assetsRoot ? apiConfig.assetsRoot : 'assets/';

        // make apiConfig available
        this.apiConfig = apiConfig;
    };

    theApp.resetAppToInitialState = function()
    {
        this.addAllShutdowns();
        this.setApiConfig();

        this.session = new Session();
        this.user = this.session.user;
        this.userAccessRights = this.session.userAccessRights;

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

        // add error logging
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

        // add ajax 402 handler
        this.addInitializer(function()
        {
            initializeAjax402(this);
        });

        // setup token
        this.addInitializer(function()
        {
            this.session.initRefreshToken();
        });

        // setup ajax auth and caching and timezone handling
        this.addInitializer(function()
        {
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

        // add data managers
        this.addInitializer(function()
        {
            var dataManagerOptions = {
                identityMap: new IdentityMap(),
                resetPatterns: [/athletes\/[0-9]+\/workouts/]
            };

            this.dataManager = new DataManager(dataManagerOptions);
            this.calendarManager = new CalendarManager({ dataManager: this.dataManager });
            this.selectionManager = new SelectionManager();

            // reset reporting manager when we save or delete workouts
            this.on("save:model destroy:model", function(model)
            {
                var modelUrl = _.result(model, "url");
                this.dataManager.reset(modelUrl);
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

        this.addInitializer(function()
        {
            var self = this;

            this.session.userPromise.done(function()
            {
                self.buildInfo.fetch();
                self.timeZones.fetch();
            });
        });

        this.addInitializer(function()
        {
            var self = this;
          
            this.session.userPromise.done(function()
            {
                RollbarManager.setUser(self.user);

                var athletePromise = self.user.getAthleteSettings().fetch();

                $.when(self.session.userAccessPromise, athletePromise).done(function()
                {
                    if (!self.featureAllowedForUser("alpha1", self.user))
                    {
                        self.session.logout(notAllowedForAlphaTemplate);
                    }
                });
            });
        });

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
            this.controllers.calendarController = new CalendarController({ dataManager: this.dataManager });
            this.controllers.dashboardController = new DashboardController({ dataManager: this.dataManager });
            this.controllers.homeController = new HomeController({ dataManager: this.dataManager });
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
            ToolTips.initTooltips();
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
            
            $(document).on("keypress.filterNumberInput", ".numberInput", function (evt)
                {
                    var charCode = (evt.which) ? evt.which : evt.keyCode;
                    if(!TextFieldNumberFilter.isNumberKey(charCode))
                    {
                        evt.preventDefault();
                    }
                }
            );
        });
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
            if(_.isFunction(controller.preload))
            {
                controller.preload();
            }
            this.currentController = controller;
            this.mainRegion.show(controller.getLayout());
        }
    };

    theApp.isLive = function()
    {
        // if we're in local or dev mode, use DEBUG log level etc
        // but if we have a 'global', then we're testing with node/jasmine, so don't output debug messages to clutter test output
        if ((this.apiRoot.indexOf('local') >= 0 || this.apiRoot.indexOf('dev') >= 0))
            return false;

        return true;
    };

    theApp.isLocal = function()
    {
        var href = document.location.href;
        return href && href.indexOf("localhost") >= 0 || href.indexOf("app.local.trainingpeaks.com") >= 0;
    };

    theApp.getBodyElement = function()
    {
        if (!this.$body)
            this.$body = $("body");

        return this.$body;
    };

    theApp.reloadApp = function()
    {
        window.location.reload();
    };

    window.theMarsApp = theApp;
    theApp.resetAppToInitialState();

    if (typeof global !== 'undefined')
    {
        global.theMarsApp = theApp;
    }

    return theApp;

});
