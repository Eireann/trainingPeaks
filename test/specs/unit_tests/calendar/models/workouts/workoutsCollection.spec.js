// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "moment",
    "testUtils/testHelpers",
    "models/workoutsCollection"
],
function(
    moment,
    testHelpers,
    WorkoutsCollection
    )
{
    describe("Workouts Collection", function()
    {
        // user needs an athlete id for some of these tests to run
        beforeEach(function()
        {
            testHelpers.theApp.user.setCurrentAthleteId(1234, true);
        });

        afterEach(function()
        {
            testHelpers.theApp.user.setCurrentAthleteId(null, true);
        });

        it("should load as a module", function()
        {
            expect(WorkoutsCollection).toBeDefined();
        });

        describe("url", function()
        {
            it("Should point to the correct api server url", function()
            {
                var startDate = moment().subtract("days", 30);
                var endDate = moment().add("days", 30);
                var dateFormat = "YYYY-MM-DD";
                var athleteId = 1234;
                var expectedUrl = "/fitness/v1/athletes/1234/workouts/" +
                    startDate.format(dateFormat) + "/" +
                    endDate.format(dateFormat);
                var workouts = new WorkoutsCollection([], { startDate: startDate, endDate: endDate });
                expect(workouts.url()).toContain(expectedUrl);
                expect(workouts.url()).toContain(testHelpers.theApp.apiRoot);
            });
        });

    });

});
