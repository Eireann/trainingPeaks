// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "views/library/libraryView",
    "hbs!templates/views/library/libraryView"
],
function(LibraryView, LibraryTemplate)
{

    describe("LibraryView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(LibraryView).toBeDefined();
        });

    });

});