// use requirejs() here, not define(), for jasmine compatibility
requirejs(
    ["models/library/libraryExercise"],
function(LibraryExerciseModel)
{
    describe("Library Exercise Model", function()
    {

        it("Should load as a module", function()
        {
            expect(LibraryExerciseModel).toBeDefined();
        });

        it("Should use ExerciseLibraryItemId as model id", function()
        {
            var exerciseId = "098765";
            var exercise = new LibraryExerciseModel({ ExerciseLibraryItemId: exerciseId });
            expect(exercise.id).toEqual(exerciseId);
        });

    });

});