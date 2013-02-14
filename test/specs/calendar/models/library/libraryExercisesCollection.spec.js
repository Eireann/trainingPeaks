// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
"app",
"models/library/libraryExercisesCollection"],
function(theMarsApp, LibraryExercisesCollection)
{
    describe("Library Exercises Collection", function()
    {
        it("should load as a module", function()
        {
            expect(LibraryExercisesCollection).toBeDefined();
        });
    });

});