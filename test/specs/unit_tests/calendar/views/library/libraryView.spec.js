// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "views/calendar/library/libraryView",
    "views/calendar/library/exerciseLibraryView",
    "hbs!templates/views/calendar/library/libraryView"
],
function(LibraryView, ExerciseLibraryView, LibraryTemplate)
{
    describe("LibraryView ", function()
    {
        it("Should be loaded as a module", function()
        {
            expect(LibraryView).toBeDefined();
        });

        describe("Rendering", function()
        {
            it("Should render without errors", function()
            {
                var library = new LibraryView();
                var renderIt = function()
                {
                    library.render();
                };
                expect(renderIt).not.toThrow();
            });

            it("Should have an #activeLibraryContainer element", function()
            {
                var library = new LibraryView();
                library.render();
                expect(library.$("#activeLibraryContainer").length).toEqual(1);
            });

            it("Should have an #tabs element", function()
            {
                var library = new LibraryView();
                library.render();
                expect(library.$("#tabs").length).toEqual(1);
            });
        });

        describe("Tab Switching", function()
        {
            it("Should watch for tab click events", function()
            {
                expect(LibraryView.prototype.events["click #tabs > div"]).toBeDefined();
                expect(LibraryView.prototype.events["click #tabs > div"]).toBe("_onTabClick");
                expect(LibraryView.prototype._onTabClick).toBeDefined();
                expect(typeof LibraryView.prototype._onTabClick).toBe('function');
            });
        });

    });

});
