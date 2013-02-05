define(
[
    "TP",
    "models/session",
    "models/clientEventsCollection",
    "controllers/navigationController",
    "controllers/loginController",
    "controllers/calendarController",
    "router",
    "marionette.faderegion"
],
function(TP, Session, ClientEventsCollection, NavigationController, LoginController, CalendarController, Router)
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
    });

    // add logging
    theApp.addInitializer(function initLogging()
    {
        this.logger = new TP.Logger();
        if (this.apiRoot.indexOf('local') > 0 || this.apiRoot.indexOf('dev') > 0)
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

    var apiRoots =
    {
        live: "https://api.trainingpeaks.com",
        deploy: "https://apideploy.trainingpeaks.com",
        dev: "http://api.dev.trainingpeaks.com",
        local: "http://localhost:8900"
    };

    theApp.root = "/Mars";
    theApp.apiRoot = apiRoots.dev;

    window.theMarsApp = theApp;

    if (typeof global !== 'undefined')
    {
        global.theMarsApp = theApp;
    }

    return theApp;
});
