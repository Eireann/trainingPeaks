// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "views/dashboard/dashboardLibraryView"
],
function(DashboardLibraryView)
{

    describe("DashboardLibraryView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(DashboardLibraryView).toBeDefined();
        });

        describe("Rendering", function()
        {
            it("Should render without errors", function()
            {
                var library = new DashboardLibraryView();
                library.render();
            });

             it("Should have an #activeLibraryContainer element", function()
             {
                 var library = new DashboardLibraryView();
                 library.render();
                 expect(library.$("#activeLibraryContainer").length).toEqual(1);
             });

             it("Should have an #tabs element", function()
             {
                 var library = new DashboardLibraryView();
                 library.render();
                 expect(library.$("#tabs").length).toEqual(1);
             });
        });

        describe("Tab Switching", function()
        {
            it("Should watch for tab click events", function()
            {
                expect(DashboardLibraryView.prototype.events["click #tabs > div"]).toBeDefined();
                expect(DashboardLibraryView.prototype.events["click #tabs > div"]).toBe("onTabClick");
                expect(DashboardLibraryView.prototype.onTabClick).toBeDefined();
                expect(typeof DashboardLibraryView.prototype.onTabClick).toBe('function');
            });

            it("Should call toggleLibrary", function()
            {
                var librarySpy = jasmine.createSpyObj("Library View Spy", ["toggleLibrary"]);
                var clickEvent = {
                    target: {
                        id: 'someLibraryName'
                    }
                };
                DashboardLibraryView.prototype.onTabClick.call(librarySpy, clickEvent);
                expect(librarySpy.toggleLibrary).toHaveBeenCalledWith('someLibraryName');
            });

            describe("Switch Library", function()
            {

                it("Should set the active library", function()
                {
                    var library = new DashboardLibraryView();
                    library.render();
                    library.switchLibrary('chartsLibrary');
                    expect(library.activeLibraryName).toBe('chartsLibrary');
                });

            });

            describe("Show and hide library", function()
            {

                describe("Show library", function()
                {

                    var libraryView;
                    beforeEach(function()
                    {
                        libraryView = new DashboardLibraryView();
                        libraryView.render();
                        libraryView.activeLibraryName = 'chartsLibrary';
                    });

                    it("Should turn on tab", function()
                    {
                        spyOn(libraryView, "isOpen").andReturn(true);
                        spyOn(libraryView, "turnOnTab");
                        libraryView.showLibrary();
                        expect(libraryView.turnOnTab).toHaveBeenCalledWith("chartsLibrary");
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
                        libraryView = new DashboardLibraryView();
                        libraryView.render();
                        libraryView.activeLibraryName = 'chartsLibrary';
                    });

                    it("Should turn off tab", function()
                    {
                        spyOn(libraryView, "isOpen").andReturn(true);
                        spyOn(libraryView, "turnOffTab");
                        libraryView.hideLibrary();
                        expect(libraryView.turnOffTab).toHaveBeenCalledWith("chartsLibrary");
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

