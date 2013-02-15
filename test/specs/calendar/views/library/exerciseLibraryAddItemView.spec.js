// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "views/library/exerciseLibraryAddItemView"
],
function(ExerciseLibraryAddItemView)
{

    describe("ExerciseLibraryAddItemView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(ExerciseLibraryAddItemView).toBeDefined();
        });

    });

});