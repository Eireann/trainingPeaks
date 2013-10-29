// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs"
],
function(
    testHelpers,
    xhrData
)
{

    xdescribe("Home", function()
    {

        var $mainRegion;

        beforeEach(function()
        {
            testHelpers.startTheApp();
            $mainRegion = testHelpers.theApp.mainRegion.$el;
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should display the home page after login", function()
        {
            testHelpers.submitLogin();
            expect(testHelpers.theApp.router.getCurrentRoute()).toBe("home");
            expect(testHelpers.theApp.getCurrentController().cid).toBe(testHelpers.theApp.controllers.homeController.cid);
            expect($mainRegion.find("#homeContainer").length).toBe(1);
        });

        it("Should load athlete activity feed for athletes", function()
        {
            testHelpers.submitLogin(xhrData.users.barbkprem);
            expect($mainRegion.find("#homeContainer").length).toBe(1);
            expect($mainRegion.find("#athleteHomeActivityFeed").length).toBe(1);
        });

        it("Should load coach athletes list for coaches", function()
        {
            testHelpers.submitLogin(xhrData.users.supercoach);
            expect($mainRegion.find("#homeContainer").length).toBe(1);
            var homeText = $mainRegion.find("#homeContainer").text();
            expect(homeText).toContain("Athlete One");
            expect(homeText).toContain("Another Athlete");
        });
    });


});
