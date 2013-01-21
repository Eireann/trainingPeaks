describe("Workouts Collection spec", function()
{

    // Use 'it("",function(done) ' - this makes jasmine wait for done() to be called,
    // or else some of our tests won't run if requirejs files don't return in time
    it("Loading workoutsCollection tests via requirejs", function(done)
    {

        // use requirejs() here, not define(), for jasmine compatibility
        requirejs(
        ["models/workoutsCollection"],
        function(WorkoutsCollection)
        {
            describe("Workouts Collection", function()
            {
                it("should load as a module", function()
                {
                    expect(WorkoutsCollection).toBeDefined();
                });

            });

            // have to call done() after our final test
            done();
        });

    });

});