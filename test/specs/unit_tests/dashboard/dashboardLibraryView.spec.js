// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "TP",
    "views/dashboard/dashboardLibraryView"
],
function(TP, DashboardLibraryView)
{

    describe("DashboardLibraryView ", function()
    {

        var viewOptions;

        beforeEach(function()
        {
            viewOptions = {
                collections: {
                    charts: new TP.Collection()
                }
            };

            viewOptions.collections.charts.addAllAvailableCharts = jasmine.createSpy("addAllAvailableCharts");
        });

        it("Should be loaded as a module", function()
        {
            expect(DashboardLibraryView).toBeDefined();
        });

        describe("Rendering", function()
        {
            it("Should render without errors", function()
            {
                var library = new DashboardLibraryView(viewOptions);
                library.render();
            });

             it("Should have an #activeLibraryContainer element", function()
             {
                 var library = new DashboardLibraryView(viewOptions);
                 library.render();
                 expect(library.$("#activeLibraryContainer").length).toEqual(1);
             });

             it("Should have an #tabs element", function()
             {
                 var library = new DashboardLibraryView(viewOptions);
                 library.render();
                 expect(library.$("#tabs").length).toEqual(1);
             });
        });

        describe("Tab Switching", function()
        {
            it("Should watch for tab click events", function()
            {
                expect(DashboardLibraryView.prototype.events["click #tabs > div"]).toBeDefined();
                expect(DashboardLibraryView.prototype.events["click #tabs > div"]).toBe("_onTabClick");
                expect(DashboardLibraryView.prototype._onTabClick).toBeDefined();
                expect(typeof DashboardLibraryView.prototype._onTabClick).toBe('function');
            });

        });

    });

});

