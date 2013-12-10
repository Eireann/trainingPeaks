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
            expect($mainRegion.find(".athleteCalendarSelect").length).to.equal(1);
            expect($mainRegion.find(".athleteCalendarSelect option").length).to.equal(2);
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

        // routing doesn't work properly here?
        xdescribe("For athlete id from url (TODO: Why doesn't router.navigate to a specific athlete id work? would be nice to be able to test this behavior)", function()
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

            it("Should request data for the current athlete id", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/23456")).to.equal(true);
            });

            it("Should not request data for other athlete ids", function()
            {
                expect(testHelpers.hasRequest("GET", "fitness/v1/athletes/12345")).to.equal(false);
            });
        });

        describe("Switch athlete from dropdown", function()
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

            xit("Should change the user id on selecting a new athlete (TODO: doesn't work, same router issue as above)", function()
            {
                $mainRegion.find(".athleteCalendarSelect").val(23456).trigger("change");
                expect(testHelpers.theApp.user.getCurrentAthleteId()).to.equal(23456);
            });
        });
    });


});
