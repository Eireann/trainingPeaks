define(
[
    "jquery", "backbone.marionette"
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
        mainRegion: "#main"
    });

    theApp.on("initialize:before", function ()
    {
    });

    theApp.on("initialzie:after", function ()
    {
    });

    theApp.root = "/Mars";

    return theApp;
});
