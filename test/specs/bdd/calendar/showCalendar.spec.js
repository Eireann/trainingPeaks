// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app"
],
function(
    testHelpers,
    xhrData,
    theApp)
{

    xdescribe("open the calendar", function()
    {
        var $el;

        beforeEach(function()
        {
            testHelpers.startTheApp();
            $el = theApp.mainRegion.$el;
            testHelpers.setupFakeAjax();
        });

        // for some reason afterEach is undefined here, 
        // but we can access it via jasmine.getEnv()
        // need to cleanup our mess
        jasmine.getEnv().afterEach(function()
        {
            testHelpers.reset();
        });


        it("Should display today", function()
        {
            testHelpers.submitLogin(xhrData.users.barbkprem);
            theApp.router.navigate("calendar", true);
            var todayElement = $el.find(".day.today");
            expect(todayElement.length).toBe(1);
        });

    });


});