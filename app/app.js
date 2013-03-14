define(
[
    "TP",
    "framework/ajaxAuth",
    "framework/ajaxCaching",
    "framework/ajaxTimezone",
    "models/session",
    "models/userModel",
    "models/userSettingsModel",
    "models/clientEventsCollection",
    "controllers/navigationController",
    "controllers/loginController",
    "controllers/calendarController",
    "router",
    "marionette.faderegion"
],
function(TP, initializeAjaxAuth, ajaxCaching, initializeAjaxTimezone, Session, UserModel, UserSettingsModel, ClientEventsCollection, NavigationController, LoginController, CalendarController, Router)
{
    var theApp = new TP.Application();

    theApp.addRegions(
    {
        navRegion: "#navigation",
        mainRegion: "#main"
    });

    // add logging first
    theApp.addInitializer(function()
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
    theApp.addInitializer(function()
    {
        initializeAjaxAuth(this);
        initializeAjaxTimezone();
        ajaxCaching.initialize(this);
    });
    
    // add a session
    theApp.addInitializer(function initSession()
    {
        var self = this;

        this.user = new UserModel();
        this.userSettings = new UserSettingsModel();
        
        this.session = new Session();
        this.session.authPromise.done(function()
        {
            self.user.fetch();
        });
    });

    // add event tracking
    theApp.addInitializer(function()
    {
        this.clientEvents = new ClientEventsCollection();
    });

    // add controllers
    theApp.addInitializer(function()
    {
        // Set up controllers container and eagerly load all the required Controllers.
        this.controllers = {};

        this.controllers.navigationController = new NavigationController();
        this.controllers.loginController = new LoginController();
        this.controllers.calendarController = new CalendarController();

        this.router = new Router();
    });

    theApp.isLive = function()
    {
        // if we're in local or dev mode, use DEBUG log level etc
        // but if we have a 'global', then we're testing with node/jasmine, so don't output debug messages to clutter test output
        if ((this.apiRoot.indexOf('local') > 0 || this.apiRoot.indexOf('dev') > 0) && typeof global === 'undefined')
            return false;

        return true;
    };

    var apiRoots =
    {
        live: "https://api.trainingpeaks.com",
        uat: "http://api.uat.trainingpeaks.com",
        dev: "http://api.dev.trainingpeaks.com",
        local: "http://localhost:8900"
    };

    // get environment name from index.html build target
    var apiRootName = window.hasOwnProperty('apiRoot') ? window.apiRoot : 'dev';

    // point to appropriate api server
    theApp.apiRoot = apiRoots[apiRootName];

    // app root for router and history
    if (apiRootName !== 'live')
    {
        theApp.root = "/Mars";
    } else
    {
        theApp.root = '';
    }

    window.theMarsApp = theApp;

    if (typeof global !== 'undefined')
    {
        global.theMarsApp = theApp;
    }

    return theApp;
});
