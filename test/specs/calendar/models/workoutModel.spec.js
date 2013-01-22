describe("Workout Model spec", function()
{

    // Use 'it("",function(done) ' - this makes jasmine wait for done() to be called,
    // or else some of our tests won't run if requirejs files don't return in time
    it("Loading Workout Model test dependencies via requirejs", function(done)
    {

        // use requirejs() here, not define(), for jasmine compatibility
        requirejs(
        ["models/workoutModel"],
        function(WorkoutModel)
        {
            describe("Workout Model", function()
            {
                it("should load as a module", function()
                {
                    expect(WorkoutModel).toBeDefined();
                });

            });

            // have to call done() after our final test
            done();
        });

    });

});