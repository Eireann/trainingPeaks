// use requirejs() here, not define(), for jasmine compatibility
requirejs(
["moment",
"app",
"models/workoutsCollection"],
function(moment, theMarsApp, WorkoutsCollection)
{
    describe("Workouts Collection", function()
    {
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
                var expectedUrl = "/fitness/v1/athletes/" + theMarsApp.user.get("athletes.0.athleteId") + "/workouts/" +
                    startDate.format(dateFormat) + "/" +
                    endDate.format(dateFormat);
                var workouts = new WorkoutsCollection([], { startDate: startDate, endDate: endDate });
                expect(workouts.url()).toContain(expectedUrl);
                expect(workouts.url()).toContain(theMarsApp.apiRoot);
            });
        });

    });

});