define(
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
            expect($mainRegion.find("select.athleteCalendarSelect").length).to.equal(1);
            expect($mainRegion.find("select.athleteCalendarSelect option").length).to.equal(2);
        });

        describe("For default athlete", function()
        {

            it("Should have the first user set as the current athlete id", function()
            {
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(12345);
            });

            it("Should request data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345")).to.equal(true);
            });

            it("Should not request data for other athlete ids", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456")).to.equal(false);
            });
        });

        describe("For athlete id from url", function()
        {

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.supercoach);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                testHelpers.theApp.router.navigate("calendar/athletes/23456", true);
            });
            
            it("Should have the requested user set as the current athlete id", function()
            {
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(23456);
            });

            it("Should request settings data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/settings")).to.equal(true);
            });

            it("Should request workout data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/workouts")).to.equal(true);
            });

            it("Should not request workout data for other athlete ids", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345/workouts")).to.equal(false);
            });
        });

        describe("Switch athlete from dropdown", function()
        {

            it("Should have the first user set as the current athlete id", function()
            {
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(12345);
            });

            it("Should request workout data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345/workouts")).to.equal(true);
            });

            it("Should not request workout data for other athlete ids", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/workouts")).to.equal(false);
            });

            it("Should change the user id on selecting a new athlete", function()
            {
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(23456);
            });

            it("Should request athlete settings on selecting a new athlete", function()
            {
                testHelpers.clearRequests();
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/settings")).to.equal(true);
            });

            it("Should request athlete workouts on selecting a new athlete", function()
            {
                testHelpers.clearRequests();
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456/workouts")).to.equal(true);
            });
        });
    });


});
