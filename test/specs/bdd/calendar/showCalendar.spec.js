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

    describe("open the calendar", function()
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
            console.log(theApp.session.attributes);
            expect(theApp.session.isAuthenticated()).toBe(true);
            expect(theApp.user.get("userName")).toBe("barbkprem");
            theApp.router.navigate("calendar", true);
            var todayElement = $el.find(".day.today");
            expect(todayElement).toBeDefined();
            expect(todayElement.length).toBe(1);
        });

    });


});