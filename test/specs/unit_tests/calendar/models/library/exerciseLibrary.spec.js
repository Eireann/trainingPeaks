define(
    ["models/library/exerciseLibrary"],
function (ExerciseLibrary)
{
    describe("exercise library Model", function ()
    {

        it("Should load as a module", function ()
        {
            expect(ExerciseLibrary).to.not.be.undefined;
        });

        it("intialize should create a new library exercise collection", function ()
        {
            var exerciseLibrary = new ExerciseLibrary();

            expect(exerciseLibrary.exercises).to.not.be.undefined;
        });

        it("should fetch library exercises", function ()
        {
            var exerciseLibrary = new ExerciseLibrary();

            sinon.stub(exerciseLibrary.exercises, "fetch");
            exerciseLibrary.fetchExercises();

            expect(exerciseLibrary.exercises.fetch).to.have.been.called;
        });

        it("should not fetch library exercises", function ()
        {
            var exerciseLibrary = new ExerciseLibrary();
            exerciseLibrary.exercises.length = 2;

            sinon.stub(exerciseLibrary.exercises, "fetch");
            exerciseLibrary.fetchExercises();

            expect(exerciseLibrary.exercises.fetch).to.not.have.been.called;
        });

    });

});
