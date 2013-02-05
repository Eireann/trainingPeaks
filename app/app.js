define(
[
    "TP",
    "models/session",
    "controllers/navigationController",
    "controllers/loginController",
    "controllers/calendarController",
    "router",
    "marionette.faderegion"
],
function(TP, Session, NavigationController, LoginController, CalendarController, Router)
{
    var theApp = new TP.Application();

    theApp.addRegions(
    {
        navRegion: "#navigation",
        mainRegion: "#main"
    });

    theApp.addInitializer(function()
    {
        theApp.session = new Session({ app: this });

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
    theApp.apiRoot = apiRoots.local;

    window.theMarsApp = theApp;

    if (typeof global !== 'undefined')
    {
        global.theMarsApp = theApp;
    }

    return theApp;
});
