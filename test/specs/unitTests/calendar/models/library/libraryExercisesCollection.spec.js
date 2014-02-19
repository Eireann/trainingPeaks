define(
[
"testUtils/testHelpers",
"models/library/libraryExercisesCollection"],
function(testHelpers, LibraryExercisesCollection)
{
    describe("Library Exercises Collection", function()
    {
        it("should load as a module", function()
        {
            expect(LibraryExercisesCollection).to.not.be.undefined;
        });

        it("Should have a valid url", function()
        {

            var url = LibraryExercisesCollection.prototype.url();
            expect(url).to.contain(testHelpers.theApp.apiRoot);
            expect(url).to.contain("/exerciselibrary/v1/libraries");

        });
    });

});
