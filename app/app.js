define(
[
    "backbone.marionette"
],
function (Marionette)
{
    var theApp = new Marionette.Application();

    theApp.addRegions(
    {
        main: "#main"
    });

    theApp.on("initialize:before", function()
    {
    });

    theApp.on("initialzie:after", function()
    {      
    });

    theApp.root = "/Mars";
    return theApp;
});
