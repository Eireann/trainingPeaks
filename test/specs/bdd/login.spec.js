// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "jquery",
    "TP",
    "app"
],
function($, TP, theApp)
{

    var setupRegionElements = function()
    {
        this.navRegion.$el = $("<div id='navigation'></div>");
        this.mainRegion.$el = $("<div id='main'></div>");
    };

    var startTheApp = function(theApp)
    {
        theApp.on("initialize:before", setupRegionElements, theApp);
        theApp.start();
        TP.history.start({ pushState: false, root: theApp.root });
    };

    describe("Login", function()
    {
        it("Should have a username input", function()
        {
            startTheApp(theApp);
            theApp.router.navigate("login", true);
            console.log(theApp.mainRegion.$el.html());
            expect(theApp.mainRegion.$el.find("#username")).toBeDefined();
            expect(theApp.mainRegion.$el.find("#username").length).toBe(1);
        });
    });


});