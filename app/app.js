define(
[
    "jquery",
    "underscore",
    "backbone",
    "TP",
    "framework/ajax402",
    "framework/tooltips",
    "framework/identityMap",
    "framework/dataManager",
    "shared/managers/calendarManager",
    "shared/managers/selectionManager",
    "models/session",
    "models/buildInfo",
    "models/timeZones",
    "models/clientEventsCollection",
    "controllers/navigationController",
    "controllers/calendar/calendarController",
    "controllers/dashboardController",
    "views/buildInfoView",
    "router",
    "utilities/dragAndDropFileUploadWidget",
    "utilities/textFieldNumberFilter",
    "utilities/rollbarManager",
    "shared/utilities/featureAuthorization/featureAuthorizer",
    "hbs!templates/views/notAllowedForAlpha",
    "scripts/plugins/marionette.faderegion",
    "flot/jquery.flot",
    "flot/jquery.flot.crosshair",
    "flot/jquery.flot.resize",
    "shared/views/initialProfileView"
],
function(
    $,
    _,
    Backbone,
    TP,
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
    BuildInfoView,
    Router,
    DragAndDropFileUploadWidget,
    TextFieldNumberFilter,
    RollbarManager,
    FeatureAuthorizer,
    notAllowedForAlphaTemplate,
    fadeRegion,
    flot,
    flotCrosshair,
    flotResize,
    InitialProfileView
)
{

    var MarsApp = TP.Application.extend(
    {

        setApiConfig: function()
        {
            // simple dummy values for testing
            if (typeof apiConfig === "undefined" || typeof window.apiConfig === "undefined")
            {
                /* global apiConfig: true */
                /* exported apiConfig */
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
        },

        historyEnabled: true,

        setupBootPromises: function()
        {
            var bootDeferred = $.Deferred();
            this.bootPromise = bootDeferred.promise();

            var bootPromises = []; 
            this.addBootPromise = function(promise)
            {
                bootPromises.push(promise);
            };

            this.finalizeBootPromises = function()
            {
                $.when.apply($, bootPromises).then(bootDeferred.resolve, bootDeferred.reject);
            };
        },

        constructor: function(options)
        {
            if(!options || !options.$body)
            {
                throw new Error("TheMarsApp constructor requires a body element");
            }

            this.setupBootPromises();

            TP.Application.apply(this, arguments);

            this.$body = options.$body;

            this.setApiConfig();

            this.off();
            _.each(this.submodules, function(module) { module.stop(); });
            this._initCallbacks.reset();

            this.session = new Session();
            this.user = this.session.user;
            this.userAccessRights = this.session.userAccessRights;

            this.addBootPromise(this.session.userPromise);
            this.addBootPromise(this.session.userAccessPromise);

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

                $(document).ajaxError(function(event, xhr)
                {
                    if (xhr.status === 400 || xhr.status === 500)
                    {
                        try
                        {
                            /* global  _rollbar: false */
                            if(_rollbar)
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

            // display build info
            this.addInitializer(function()
            {
                var self = this;
                var deferred = $.Deferred();

                // The endpoint requires authentication, even though there's no sensitive info...
                // so we have to wait for that to be ready
                this.session.userPromise.done(function()
                {
                    self.buildInfo = new BuildInfoModel(
                        {
                            marsVersion: self.apiConfig.buildNumber
                        }
                    );

                    if(!self.isLive())
                    {
                        var buildInfoView = new BuildInfoView({ model: self.buildInfo });
                        self.infoRegion.show(buildInfoView);
                    }
                    var xhr = self.buildInfo.fetch();
                    xhr.then(deferred.resolve, deferred.reject);
                });
                this.addBootPromise(deferred.promise());
            });

            // setup time zones
            this.addInitializer(function()
            {
                var self = this;
                var deferred = $.Deferred();

                // The endpoint requires authentication, even though there's no sensitive info...
                // so we have to wait for that to be ready
                this.session.userPromise.done(function()
                {
                    self.timeZones = new TimeZonesModel();
                    var xhr = self.timeZones.fetch();
                    xhr.then(deferred.resolve, deferred.reject);
                });
                this.addBootPromise(deferred.promise());
            });

            // add data managers
            this.addInitializer(function()
            {
                var dataManagerOptions = {
                    identityMap: new IdentityMap(),
                    resetPatterns: [/athletes\/\d+\/workouts/, /athletes\/\d+\/timedmetrics/]
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

                this.bootPromise.then(function()
                {
                    // TODO: Once new API exists, use that
                    if(/showprofile/.test(window.location.search))
                    {
                        var view = new InitialProfileView({ model: self.user });
                        view.render();
                    }
                });
            });

            this.addInitializer(function()
            {
                var self = this;

                var deferred = $.Deferred();
                this.addBootPromise(deferred.promise());

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
                        else
                        {
                            deferred.resolve();
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
                var self = this;
                this.session.userPromise.done(function()
                {
                    self.navRegion.show(self.controllers.navigationController.getLayout());
                });
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


            // filter non-numeric input
            this.addInitializer(function ()
            {
                $(document).on("keypress.filterNumberInput", ".numberInput", function (evt)
                {
                    var charCode = (evt.which) ? evt.which : evt.keyCode;
                    if(!TextFieldNumberFilter.isNumberKey(charCode))
                    {
                        evt.preventDefault();
                    }
                });
            });

            // trigger an 'enter' event on enter key in text field
            this.addInitializer(function ()
            {
                $(document).on("keypress.watchForEnter", "input[type=text]", function (evt)
                    {
                        var charCode = (evt.which) ? evt.which : evt.keyCode;
                        if(charCode === 13)
                        {
                            var enterEvent = new $.Event("enter");
                            $(evt.currentTarget).trigger(enterEvent);
                            if(enterEvent.isDefaultPrevented())
                            {
                                evt.preventDefault();
                            }
                        }
                    }
                );
            });

            // trigger a 'cancel' event on escape key in text field
            this.addInitializer(function ()
            {
                $(document).on("keyup.watchForCancel", "input[type=text]", function (evt)
                    {
                        var charCode = (evt.which) ? evt.which : evt.keyCode;
                        if(charCode === 27)
                        {
                            var cancelEvent = new $.Event("cancel");
                            $(evt.currentTarget).trigger(cancelEvent);
                            if(cancelEvent.isDefaultPrevented())
                            {
                                evt.preventDefault();
                            }
                        }
                    }
                );
            });

            // close the top most modal view on escape
            this.addInitializer(function ()
            {
                $(document).on("keyup.closeModalOnEscape", function (evt)
                {
                    var charCode = (evt.which) ? evt.which : evt.keyCode;
                    if(charCode === 27)
                    {
                        if(!evt.isDefaultPrevented())
                        {
                            $(".modalOverlay:last").trigger("click");
                        }
                    }
                }
                );
            });


            this.addInitializer(function()
            {
                this.finalizeBootPromises();
            });

        },

        touchEnabled: false,

        isTouchEnabled: function()
        {
            return this.touchEnabled;
        },

        enableTouch: function()
        {
            this.getBodyElement().addClass("touchEnabled");
            // no zoom for touch devices because it seems to break click/hover coordinates
            $("meta[name=viewport]").attr("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
            this.touchEnabled = true;
        },

        watchForFirstTouch: function()
        {
            var self = this;
            this.getBodyElement().one("touchstart", function()
            {
                self.enableTouch();
            });
        },

        currentController: null,

        getCurrentController: function()
        {
            return this.currentController;
        },

        showController: function(controller)
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
        },

        isLive: function()
        {
            // if we're in local or dev mode, use DEBUG log level etc
            // but if we have a 'global', then we're testing with node/jasmine, so don't output debug messages to clutter test output
            if ((this.apiRoot.indexOf('local') >= 0 || this.apiRoot.indexOf('dev') >= 0))
                return false;

            return true;
        },

        isLocal: function()
        {
            var href = document.location.href;
            return href && href.indexOf("localhost") >= 0 || href.indexOf("app.local.trainingpeaks.com") >= 0;
        },

        getBodyElement: function()
        {
            return this.$body;
        }

    });

    return MarsApp;

});
