// use requirejs() here, not define(), for jasmine compatibility
requirejs(
    ["models/library/exerciseLibrary"],
function (ExerciseLibrary)
{
    describe("exercise library Model", function ()
    {

        it("Should load as a module", function ()
        {
            expect(ExerciseLibrary).toBeDefined();
        });

        it("intialize should create a new library exercise collection", function ()
        {
            var exerciseLibrary = new ExerciseLibrary();

            expect(exerciseLibrary.exercises).toBeDefined();
        });

        it("should fetch library exercises", function ()
        {
            var exerciseLibrary = new ExerciseLibrary();

            spyOn(exerciseLibrary.exercises, "fetch");
            exerciseLibrary.fetchExercises();

            expect(exerciseLibrary.exercises.fetch).toHaveBeenCalled();
        });

        it("should not fetch library exercises", function ()
        {
            var exerciseLibrary = new ExerciseLibrary();
            exerciseLibrary.exercises.length = 2;

            spyOn(exerciseLibrary.exercises, "fetch");
            exerciseLibrary.fetchExercises();

            expect(exerciseLibrary.exercises.fetch).not.toHaveBeenCalled();
        });

    });

});