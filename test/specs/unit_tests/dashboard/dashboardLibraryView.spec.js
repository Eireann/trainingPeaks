define(
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

            viewOptions.collections.charts.addAllAvailableCharts = sinon.stub();
        });

        it("Should be loaded as a module", function()
        {
            expect(DashboardLibraryView).to.not.be.undefined;
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
                 expect(library.$("#activeLibraryContainer").length).to.eql(1);
             });

             it("Should have an #tabs element", function()
             {
                 var library = new DashboardLibraryView(viewOptions);
                 library.render();
                 expect(library.$("#tabs").length).to.eql(1);
             });
        });

        describe("Tab Switching", function()
        {
            it("Should watch for tab click events", function()
            {
                expect(DashboardLibraryView.prototype.events["click #tabs > div"]).to.not.be.undefined;
                expect(DashboardLibraryView.prototype.events["click #tabs > div"]).to.equal("_onTabClick");
                expect(DashboardLibraryView.prototype._onTabClick).to.not.be.undefined;
                expect(typeof DashboardLibraryView.prototype._onTabClick).to.equal('function');
            });

        });

    });

});

