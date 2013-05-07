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

    describe("qvTabs", function()
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

        it("Should request athlete settings after resolving the login", function()
        {
            var testUser = xhrData.users.barbkprem;
            var athleteSettingsUrl = "athletes/v1/athletes/" + testUser.athletes[0].athleteId + "/settings";
            testHelpers.submitLogin(testUser);
            expect(testHelpers.hasRequest("GET", athleteSettingsUrl)).toBeTruthy();
        });

    });


});