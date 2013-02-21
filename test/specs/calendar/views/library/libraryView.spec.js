// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "views/library/libraryView",
    "views/library/exerciseLibraryView",
    "hbs!templates/views/library/libraryView"
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

        describe("Initialize view", function()
        {

            it("Should create an ExerciseLibraryView", function()
            {
                var librarySpy = jasmine.createSpy("LibraryView spy");
                spyOn(ExerciseLibraryView.prototype, "initialize").andCallThrough();
                LibraryView.prototype.initialize.call(librarySpy);
                expect(ExerciseLibraryView.prototype.initialize).toHaveBeenCalled();
                expect(librarySpy.views.exerciseLibrary).toBeDefined();
            });
        });

        describe("Tab Switching", function()
        {
            it("Should watch for tab click events", function()
            {
                expect(LibraryView.prototype.events["click #tabs > div"]).toBeDefined();
                expect(LibraryView.prototype.events["click #tabs > div"]).toBe("onTabClick");
                expect(LibraryView.prototype.onTabClick).toBeDefined();
                expect(typeof LibraryView.prototype.onTabClick).toBe('function');
            });

            it("Should call toggleLibrary", function()
            {
                var librarySpy = jasmine.createSpyObj("Library View Spy", ["toggleLibrary"]);
                var clickEvent = {
                    target: {
                        id: 'someLibraryName'
                    }
                };
                LibraryView.prototype.onTabClick.call(librarySpy, clickEvent);
                expect(librarySpy.toggleLibrary).toHaveBeenCalledWith('someLibraryName');
            });

            describe("Switch Library", function()
            {

                it("Should set the active library", function()
                {
                    var library = new LibraryView();
                    library.render();
                    library.switchLibrary('exerciseLibrary');
                    expect(library.activeLibraryName).toBeDefined();
                    expect(library.activeLibraryName).toBe('exerciseLibrary');
                });

            });

            describe("Show and hide library", function()
            {

                describe("Show library", function()
                {

                    var libraryView;
                    beforeEach(function()
                    {
                        libraryView = new LibraryView();
                        libraryView.render();
                        libraryView.activeLibraryName = 'exerciseLibrary';
                    });

                    it("Should turn on tab", function()
                    {
                        spyOn(libraryView, "isOpen").andReturn(true);
                        spyOn(libraryView, "turnOnTab");
                        libraryView.showLibrary();
                        expect(libraryView.turnOnTab).toHaveBeenCalledWith("exerciseLibrary");
                    });

                    it("Should remove 'closed' and add add 'open' class to el.parent", function()
                    {
                        spyOn(libraryView, "isOpen").andReturn(false);
                        var parentSpy = jasmine.createSpyObj('jquery spy', ['addClass', 'removeClass']);
                        parentSpy.removeClass.andReturn(parentSpy);
                        spyOn(libraryView.$el, "parent").andReturn(parentSpy);
                        libraryView.showLibrary();
                        expect(parentSpy.removeClass).toHaveBeenCalledWith('closed');
                        expect(parentSpy.addClass).toHaveBeenCalledWith('open');
                    });

                });

                describe("Hide library", function()
                {

                    var libraryView;
                    beforeEach(function()
                    {
                        libraryView = new LibraryView();
                        libraryView.render();
                        libraryView.activeLibraryName = 'exerciseLibrary';
                    });

                    it("Should turn off tab", function()
                    {
                        spyOn(libraryView, "isOpen").andReturn(false);
                        spyOn(libraryView, "turnOffTab");
                        libraryView.hideLibrary();
                        expect(libraryView.turnOffTab).toHaveBeenCalledWith("exerciseLibrary");
                    });


                    it("Should remove 'open' and add add 'closed' class to el.parent", function()
                    {
                        spyOn(libraryView, "isOpen").andReturn(true);
                        var parentSpy = jasmine.createSpyObj('jquery spy', ['addClass', 'removeClass']);
                        parentSpy.removeClass.andReturn(parentSpy);
                        spyOn(libraryView.$el, "parent").andReturn(parentSpy);
                        libraryView.hideLibrary();
                        expect(parentSpy.removeClass).toHaveBeenCalledWith('open');
                        expect(parentSpy.addClass).toHaveBeenCalledWith('closed');
                    });

                });

            });

        });

    });

});