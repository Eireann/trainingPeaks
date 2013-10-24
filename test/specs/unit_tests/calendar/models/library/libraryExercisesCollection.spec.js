// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
"testUtils/testHelpers",
"models/library/libraryExercisesCollection"],
function(testHelpers, LibraryExercisesCollection)
{
    describe("Library Exercises Collection", function()
    {
        it("should load as a module", function()
        {
            expect(LibraryExercisesCollection).toBeDefined();
        });

        it("Should have a valid url", function()
        {

            var url = LibraryExercisesCollection.prototype.url();
            expect(url).toContain(testHelpers.theApp.apiRoot);
            expect(url).toContain("/exerciselibrary/v1/libraryitems");

        });
    });

});
