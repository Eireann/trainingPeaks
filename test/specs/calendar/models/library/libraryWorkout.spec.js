// use requirejs() here, not define(), for jasmine compatibility
requirejs(
    ["models/library/libraryWorkout"],
function(LibraryWorkoutModel)
{
    describe("Library Workout Model", function()
    {

        it("Should load as a module", function()
        {
            expect(LibraryWorkoutModel).toBeDefined();
        });

        it("Should use WorkoutId as model id", function()
        {
            var workoutId = "098765";
            var workout = new LibraryWorkoutModel({ WorkoutId: workoutId });
            expect(workout.id).toEqual(workoutId);
        });

    });

});