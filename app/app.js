define(
[
    "jquery",
    "backbone.marionette",
    "marionette.faderegion"
],
function ($, Marionette)
{
    "use strict";
    
    var theApp = new Marionette.Application();

    /*
    * jQuery OAuth Authentication Hack
    * Need to figure out a better place to inject this into jQuery
    * but can't easily make it a separate plugin because I need access to the
    * Router for clean re-routing
    */
    //**********************************************************************
    $(document).ajaxSend(function (event, xhr)
    {
        if (theApp.session.isAuthenticated())
            xhr.setRequestHeader("Authorization", "Bearer " + theApp.session.get("access_token"));
    });

    $(document).ajaxError(function (event, xhr)
    {
        if (xhr.status === 401)
            theApp.trigger("api:unauthorized");
    });

    theApp.addRegions(
    {
        navRegion: "#navigation",
        mainRegion: "#main"
    });

    var apiRoots =
    {
        live: "https://api.trainingpeaks.com",
        deploy: "https://apideploy.trainingpeaks.com",
        dev: "http://apidev.trainingpeaks.com",
        local: "http://localhost:8900"
    };

    theApp.root = "/Mars";
    theApp.apiRoot = apiRoots.dev;

    return theApp;
});
