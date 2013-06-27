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

    describe("Home", function()
    {

        var $mainRegion;

        beforeEach(function()
        {
            testHelpers.startTheApp();
            $mainRegion = theApp.mainRegion.$el;
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should display the home page after login", function()
        {
            testHelpers.submitLogin();
            expect(theApp.router.getCurrentRoute()).toBe("home");
            expect(theApp.getCurrentController().cid).toBe(theApp.controllers.homeController.cid);
            expect($mainRegion.find("#homeContainer").length).toBe(1);
        });

        it("Should redirect athletes to calendar after load user data", function()
        {
            testHelpers.submitLogin(xhrData.users.barbkprem);
            expect($mainRegion.find("#homeContainer").length).toBe(0);
            expect($mainRegion.find("#calendarContainer").length).toBe(1);
        });

        it("Should load coach athletes list on home page", function()
        {
            testHelpers.submitLogin(xhrData.users.supercoach);
            expect($mainRegion.find("#homeContainer").length).toBe(1);
            var homeText = $mainRegion.find("#homeContainer").text();
            expect(homeText).toContain("Athlete One");
            expect(homeText).toContain("Another Athlete");
        });
    });


});