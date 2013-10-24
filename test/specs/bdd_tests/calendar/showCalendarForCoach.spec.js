// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "moment"
],
function(
    testHelpers,
    xhrData,
    moment)
{

    describe("open the calendar for a coach", function()
    {
        var $mainRegion;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.supercoach);
            $mainRegion = testHelpers.theApp.mainRegion.$el;
            testHelpers.theApp.router.navigate("calendar", true);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should display a list of coached athletes in the calendar", function()
        {
            expect($mainRegion.find("#athleteCalendarSelect").length).toBe(1);
            expect($mainRegion.find("#athleteCalendarSelect option").length).toBe(2);
        });

        describe("For default athlete", function()
        {

            it("Should have the first user set as the current athlete id", function()
            {
                expect(testHelpers.theApp.user.getCurrentAthleteId()).toBe(12345);
            });

            it("Should request data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345")).toBe(true);
            });

            it("Should not request data for other athlete ids", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456")).toBe(false);
            });
        });

        // routing doesn't work properly here?
        xdescribe("For athlete id from url", function()
        {

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.supercoach);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                testHelpers.theApp.router.navigate("calendar/athletes/23456", true);
            });
            
            it("Should have the requested user set as the current athlete id", function()
            {
                expect(testHelpers.theApp.user.getCurrentAthleteId()).toBe(23456);
            });

            it("Should request data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456")).toBe(true);
            });

            it("Should not request data for other athlete ids", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345")).toBe(false);
            });
        });

        xdescribe("Switch athlete from dropdown", function()
        {

            it("Should have the first user set as the current athlete id", function()
            {
                expect(testHelpers.theApp.user.getCurrentAthleteId()).toBe(12345);
            });

            it("Should request data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345")).toBe(true);
            });

            it("Should not request data for other athlete ids", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456")).toBe(false);
            });

            it("Should change the user id on selecting a new athlete", function()
            {
                $mainRegion.find("#athleteCalendarSelect").val(23456).trigger("change");
                expect(testHelpers.theApp.user.getCurrentAthleteId()).toBe(23456);
            });
        });
    });


});
