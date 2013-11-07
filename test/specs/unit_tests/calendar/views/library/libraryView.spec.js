define(
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
            expect(LibraryView).to.not.be.undefined;
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
                expect(renderIt).to.not.throw();
            });

            it("Should have an #activeLibraryContainer element", function()
            {
                var library = new LibraryView();
                library.render();
                expect(library.$("#activeLibraryContainer").length).to.eql(1);
            });

            it("Should have an #tabs element", function()
            {
                var library = new LibraryView();
                library.render();
                expect(library.$("#tabs").length).to.eql(1);
            });
        });

        describe("Tab Switching", function()
        {
            it("Should watch for tab click events", function()
            {
                expect(LibraryView.prototype.events["click #tabs > div"]).to.not.be.undefined;
                expect(LibraryView.prototype.events["click #tabs > div"]).to.equal("_onTabClick");
                expect(LibraryView.prototype._onTabClick).to.not.be.undefined;
                expect(typeof LibraryView.prototype._onTabClick).to.equal('function');
            });
        });

    });

});
