// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "moment",
    "app",
    "models/entriesCollection"
],
function(
    testHelpers,
    xhrData,
    moment,
    theMarsApp,
    EntriesCollection
    )
{
    describe("Entries Collection", function()
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
            expect(EntriesCollection).toBeDefined();
        });

        describe("fetch", function()
        {
            it("Should generate the correct URL", function()
            {
                var startDate = moment().subtract("days", 30);
                var endDate = moment().add("days", 30);
                var dateFormat = "YYYY-MM-DD";
                var athleteId = 1234;
                var expectedUrl = "/fitness/v1/athletes/" + theMarsApp.user.get("athletes.0.athleteId") + "/workouts/" +
                    startDate.format(dateFormat) + "/" +
                    endDate.format(dateFormat);
                var entries = new EntriesCollection();

                expect(entries.url({ startDate: startDate, endDate: endDate })).toContain(expectedUrl);
                
            });
        });

    });

});