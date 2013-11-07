define(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs"
],
function(
    testHelpers,
    xhrData
)
{

    xdescribe("Home (Disabled until we start work on home again)", function()
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
            expect(testHelpers.theApp.router.getCurrentRoute()).to.equal("home");
            expect(testHelpers.theApp.getCurrentController().cid).to.equal(testHelpers.theApp.controllers.homeController.cid);
            expect($mainRegion.find("#homeContainer").length).to.equal(1);
        });

        it("Should load athlete activity feed for athletes", function()
        {
            testHelpers.submitLogin(xhrData.users.barbkprem);
            expect($mainRegion.find("#homeContainer").length).to.equal(1);
            expect($mainRegion.find("#athleteHomeActivityFeed").length).to.equal(1);
        });

        it("Should load coach athletes list for coaches", function()
        {
            testHelpers.submitLogin(xhrData.users.supercoach);
            expect($mainRegion.find("#homeContainer").length).to.equal(1);
            var homeText = $mainRegion.find("#homeContainer").text();
            expect(homeText).to.contain("Athlete One");
            expect(homeText).to.contain("Another Athlete");
        });
    });


});
