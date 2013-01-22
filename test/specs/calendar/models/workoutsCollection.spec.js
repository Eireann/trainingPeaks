describe("Workouts Collection spec", function()
{

    // Use 'it("",function(done) ' - this makes jasmine wait for done() to be called,
    // or else some of our tests won't run if requirejs files don't return in time
    it("Loading workoutsCollection tests via requirejs", function(done)
    {

        // use requirejs() here, not define(), for jasmine compatibility
        requirejs(
        ["moment",
        "app",
        "models/workoutsCollection"],
        function(moment, theApp, WorkoutsCollection)
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
                        var expectedUrl = "/WebApiServer/Fitness/V1/workouts/" +
                            startDate.format(dateFormat) + "/" +
                            endDate.format(dateFormat);
                        var workouts = new WorkoutsCollection([], { startDate: startDate, endDate: endDate });
                        expect(workouts.url()).toContain(expectedUrl);
                        expect(workouts.url()).toContain(theApp.apiRoot);
                    });
                });

            });

            // have to call done() after our final test
            done();
        });

    });

});