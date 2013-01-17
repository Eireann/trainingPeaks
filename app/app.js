define(
[
    "backbone.marionette",
    "hbs!templates/layouts/default"
],
function (Marionette, DefaultLayoutTemplate)
{
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
        var authToken = theApp.session.get("access_token");
        if (authToken)
            xhr.setRequestHeader("Authorization", "Bearer " + authToken);
    });

    $(document).ajaxError(function (event, xhr)
    {
        if (xhr.status === 401)
            theApp.trigger("api:unauthorized");
    });

    theApp.addRegions(
    {
        regionMain: "#main"
    });

    theApp.on("initialize:before", function ()
    {
    });

    theApp.on("initialzie:after", function()
    {      
    });
    
    theApp.initAppLayout = function ()
    {
        var AppLayout = Backbone.Marionette.Layout.extend(
        {
            template:
            {
                type: "handlebars",
                template: DefaultLayoutTemplate
            },
            regions:
            {
                loginRegion: "#login",
                calendarRegion: "#calendarContainer"
            }
        });
        this.appLayout = new AppLayout();
        theApp.regionMain.show(this.appLayout);
    };

    theApp.initAppLayout();
    theApp.root = "/Mars";

    return theApp;
});
