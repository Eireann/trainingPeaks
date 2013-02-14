// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
"app",
"models/library/libraryWorkoutsCollection"],
function(theMarsApp, LibraryWorkoutsCollection)
{
    describe("Library Workouts Collection", function()
    {
        it("should load as a module", function()
        {
            expect(LibraryWorkoutsCollection).toBeDefined();
        });
    });

});