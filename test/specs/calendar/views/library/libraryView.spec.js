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

            it("Should call switchLibrary", function()
            {
                var librarySpy = jasmine.createSpyObj("Library View Spy", ["switchLibrary"]);
                var clickEvent = {
                    target: {
                        id: 'someLibraryName'
                    }
                };
                LibraryView.prototype.onTabClick.call(librarySpy, clickEvent);
                expect(librarySpy.switchLibrary).toHaveBeenCalledWith('someLibraryName');
            });

            describe("Switch Library", function()
            {

                it("Should show a waiting indicator", function()
                {
                    var library = new LibraryView();
                    library.render();
                    spyOn(library, "onWaitStart");
                    library.switchLibrary('exerciseLibrary');
                    expect(library.onWaitStart).toHaveBeenCalled();
                });

                it("Should remove the waiting indicator when finished", function()
                {
                    var library = new LibraryView();
                    library.render();
                    spyOn(library, "onWaitStop");
                    library.switchLibrary('exerciseLibrary');
                    expect(library.onWaitStop).toHaveBeenCalled();
                });

                it("Should set the active library", function()
                {
                    var library = new LibraryView();
                    library.render();
                    library.switchLibrary('exerciseLibrary');
                    expect(library.activeLibrary).toBeDefined();
                    expect(library.activeLibrary.libraryName).toBe('exerciseLibrary');
                });

                it("Should render the new library", function()
                {
                    var library = new LibraryView();
                    spyOn(library, 'renderActiveLibrary');
                    library.render();
                    library.switchLibrary('exerciseLibrary');
                    expect(library.renderActiveLibrary).toHaveBeenCalled();
                });

                it("Should not close the old library if it is same as new library", function()
                {
                    var library = new LibraryView();
                    spyOn(library, 'renderActiveLibrary');
                    library.render();
                    library.switchLibrary('exerciseLibrary');
                    spyOn(library.activeLibrary, "close");
                    library.switchLibrary('exerciseLibrary');
                    expect(library.activeLibrary.close).not.toHaveBeenCalled();
                });

                it("Should close the old library if it is not the same as the new library", function()
                {
                    var library = new LibraryView();
                    spyOn(library, 'renderActiveLibrary');
                    library.render();
                    library.switchLibrary('mealLibrary');
                    var mealLibrary = library.activeLibrary;
                    spyOn(mealLibrary, "close");
                    library.switchLibrary('exerciseLibrary');
                    expect(mealLibrary.close).toHaveBeenCalled();
                });
            });

            describe("Render active library", function()
            {
                var activeLibrarySpy;
                var libraryViewSpy;
                beforeEach(function()
                {
                    activeLibrarySpy = jasmine.createSpyObj("active library spy", ["delegateEvents", "render"]);
                    activeLibrarySpy.$el = {};

                    libraryViewSpy = {
                        ui: {
                            activeLibraryContainer: jasmine.createSpyObj('ui container spy', ['append', 'html'])
                        },
                        activeLibrary: activeLibrarySpy
                    };
                });

                it("Should call delegateEvents on active library", function()
                {
                    LibraryView.prototype.renderActiveLibrary.call(libraryViewSpy);
                    expect(activeLibrarySpy.delegateEvents).toHaveBeenCalled();
                });

                it("Should call render on active library", function()
                {
                    LibraryView.prototype.renderActiveLibrary.call(libraryViewSpy);
                    expect(activeLibrarySpy.render).toHaveBeenCalled();
                });

                it("Should empty activeLibraryContainer", function()
                {
                    LibraryView.prototype.renderActiveLibrary.call(libraryViewSpy);
                    expect(libraryViewSpy.ui.activeLibraryContainer.html).toHaveBeenCalledWith("");
                });

                it("Should append active library's $el to activeLibraryContainer", function()
                {
                    LibraryView.prototype.renderActiveLibrary.call(libraryViewSpy);
                    expect(libraryViewSpy.ui.activeLibraryContainer.append).toHaveBeenCalledWith(activeLibrarySpy.$el);
                });
            });

            describe("Show and hide library", function()
            {
                
                describe("Toggle", function()
                {
                    it("Should call showLibrary if not open", function()
                    {
                        var librarySpy = jasmine.createSpyObj('library view spy', ['showLibrary', 'hideLibrary', 'isOpen']);
                        librarySpy.isOpen.andReturn(false);
                        LibraryView.prototype.toggleLibrary.call(librarySpy);
                        expect(librarySpy.showLibrary).toHaveBeenCalled();
                        expect(librarySpy.hideLibrary).not.toHaveBeenCalled();
                    });

                    it("Should call hideLibrary if open", function()
                    {
                        var librarySpy = jasmine.createSpyObj('library view spy', ['showLibrary', 'hideLibrary', 'isOpen']);
                        librarySpy.isOpen.andReturn(true);
                        LibraryView.prototype.toggleLibrary.call(librarySpy);
                        expect(librarySpy.hideLibrary).toHaveBeenCalled();
                        expect(librarySpy.showLibrary).not.toHaveBeenCalled();
                    });
                });

                describe("Show library", function()
                {

                    var libraryView;
                    beforeEach(function()
                    {
                        libraryView = new LibraryView();
                        libraryView.render();
                        libraryView.activeLibrary = libraryView.views.exerciseLibrary;
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
                        libraryView.activeLibrary = libraryView.views.exerciseLibrary;
                    });

                    it("Should turn off tab", function()
                    {
                        spyOn(libraryView, "isOpen").andReturn(false);
                        spyOn(libraryView, "turnOffTab");
                        libraryView.hideLibrary();
                        expect(libraryView.turnOffTab).toHaveBeenCalledWith("exerciseLibrary");
                    });

                    it("Should call callback", function()
                    {

                        var calledBack = false;
                        spyOn(libraryView, "isOpen").andReturn(false);
                        spyOn(libraryView, "turnOffTab");

                        var afterHide = function()
                        {
                            calledBack = true;
                        };

                        runs(function()
                        {
                            libraryView.hideLibrary(afterHide);
                        });

                        waitsFor(function()
                        {
                            return calledBack;
                        }, "The afterHide callback should have been shown", 1000);

                    });

                    it("Should remove 'open' and add add 'closed' class to el.parent", function()
                    {
                        spyOn(libraryView, "isOpen").andReturn(true);
                        var parentSpy = jasmine.createSpyObj('jquery spy', ['addClass', 'removeClass']);
                        parentSpy.removeClass.andReturn(parentSpy);
                        spyOn(libraryView.$el, "parent").andReturn(parentSpy);

                        var calledBack = false;

                        var afterHide = function()
                        {
                            calledBack = true;
                        };

                        runs(function()
                        {
                            libraryView.hideLibrary(afterHide);
                        });

                        waitsFor(function()
                        {
                            return calledBack;
                        }, "The afterHide callback should have been shown", 1000);


                        runs(function()
                        {
                            expect(parentSpy.removeClass).toHaveBeenCalledWith('open');
                            expect(parentSpy.addClass).toHaveBeenCalledWith('closed');
                        });
                    });

                });

            });

        });

    });

});