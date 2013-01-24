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

});