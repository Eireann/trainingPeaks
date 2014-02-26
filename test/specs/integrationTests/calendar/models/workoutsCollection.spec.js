define(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "moment",
    "models/workoutsCollection"
],
function(
    testHelpers,
    xhrData,
    moment,
    WorkoutsCollection
    )
{
    describe("Workouts Collection", function()
    {

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("should load as a module", function()
        {
            expect(WorkoutsCollection).to.not.be.undefined;
        });

        describe("url", function()
        {
            it("Should point to the correct api server url", function()
            {
                var startDate = moment().subtract("days", 30);
                var endDate = moment().add("days", 30);
                var dateFormat = "YYYY-MM-DD";
                var athleteId = 1234;
                var expectedUrl = "/fitness/v1/athletes/" + testHelpers.theApp.user.get("athletes.0.athleteId") + "/workouts/" +
                    startDate.format(dateFormat) + "/" +
                    endDate.format(dateFormat);
                var workouts = new WorkoutsCollection([], { startDate: startDate, endDate: endDate });
                expect(workouts.url()).to.contain(expectedUrl);
                expect(workouts.url()).to.contain(testHelpers.theApp.apiRoot);
            });
        });

    });

});
