// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "TP",
    "views/dashboard/dashboardChartsLibraryView",
    "views/dashboard/library/chartTileView"
],
function(TP, DashboardChartsLibraryView, ChartTileView)
{

    describe("DashboardChartsLibraryView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(DashboardChartsLibraryView).toBeDefined();
        });

        it("Should instantiate", function()
        {
            var newLibrary = function()
            {
                var view = new DashboardChartsLibraryView();
            };
            expect(newLibrary).not.toThrow();
        });

        it("Should render", function()
        {
            var view = new DashboardChartsLibraryView();
            view.render();
            expect(view.$el).toBeDefined();
        });

        describe("getItemView", function()
        {
            it("Should return TP.ItemView if no item is passed", function()
            {
                expect(DashboardChartsLibraryView.prototype.getItemView()).toBe(TP.ItemView);
            });

            it("Should return ChartTileView if item is passed", function()
            {
                expect(DashboardChartsLibraryView.prototype.getItemView({})).toBe(ChartTileView);
            });
        });

        describe("search", function()
        {
            var view;

            beforeEach(function()
            {
                var collection = new TP.Collection();
                collection.add(new TP.Model({name: "A"}));
                collection.add(new TP.Model({name: "B"}));
                collection.add(new TP.Model({name: "C"}));

                view = new DashboardChartsLibraryView({collection: collection});

                view.render();
            });

            it("Should start with items in collection", function()
            {
                expect(view.collection.length).toBe(3);
            });

            it("Should filter on keyup", function()
            {
                view.ui.search.val("xxxxxxxxxx");
                view.ui.search.trigger("keyup");
                expect(view.collection.length).toBe(0);
            });

        });

    });

});

