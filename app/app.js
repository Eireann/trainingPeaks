define(
[
    "TP",
    "models/session",
    "models/userModel",
    "models/clientEventsCollection",
    "controllers/navigationController",
    "controllers/loginController",
    "controllers/calendarController",
    "router",
    "marionette.faderegion"
],
function(TP, Session, UserModel, ClientEventsCollection, NavigationController, LoginController, CalendarController, Router)
{
    var theApp = new TP.Application();

    theApp.addRegions(
    {
        navRegion: "#navigation",
        mainRegion: "#main"
    });

    // add a session
    theApp.addInitializer(function initSession()
    {
        this.session = new Session({ app: this });
        this.user = new UserModel();
    });

    // add logging
    theApp.addInitializer(function initLogging()
    {
        this.logger = new TP.Logger();

        // in local environment, and not in test mode? set log level to debug
        if (!this.isLive())
        {
            this.logger.setLogLevel(this.logger.logLevels.DEBUG);
        } else
        {
            this.logger.setLogLevel(this.logger.logLevels.ERROR);
        }
    });

    // add event tracking
    theApp.addInitializer(function initClientEventTracker()
    {
        this.clientEvents = new ClientEventsCollection();
    });

    // add controllers
    theApp.addInitializer(function initControllers()
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
        deploy: "https://apideploy.trainingpeaks.com",
        dev: "http://api.dev.trainingpeaks.com",
        local: "http://localhost"
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
