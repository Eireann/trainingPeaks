define(
[
    "Backbone.Marionette"
],
function ()
{
    var theApp = new Backbone.Marionette.Application();

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

    theApp.root = "";
    return theApp;
});
