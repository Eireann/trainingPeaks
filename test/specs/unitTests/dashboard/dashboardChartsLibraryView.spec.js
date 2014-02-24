define(
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
            expect(DashboardChartsLibraryView).to.not.be.undefined;
        });

        it("Should instantiate", function()
        {
            var newLibrary = function()
            {
                var view = new DashboardChartsLibraryView();
            };
            expect(newLibrary).to.not.throw();
        });

        it("Should render", function()
        {
            var view = new DashboardChartsLibraryView();
            view.render();
            expect(view.$el).to.not.be.undefined;
        });

        describe("getItemView", function()
        {
            it("Should return TP.ItemView if no item is passed", function()
            {
                expect(DashboardChartsLibraryView.prototype.getItemView()).to.equal(TP.ItemView);
            });

            it("Should return ChartTileView if item is passed", function()
            {
                expect(DashboardChartsLibraryView.prototype.getItemView({})).to.equal(ChartTileView);
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

                var featureAuthorizer = {

                    features: {
                        UsePod: null,
                        ViewPod: null
                    },

                    canAccessFeature: function() { return true; }
                };

                view = new DashboardChartsLibraryView({collection: collection, featureAuthorizer: featureAuthorizer });

                view.render();
            });

            it("Should start with items in collection", function()
            {
                expect(view.collection.length).to.equal(3);
            });

            it("Should filter on keyup", function()
            {
                view.ui.search.val("xxxxxxxxxx");
                view.ui.search.trigger("keyup");
                expect(view.collection.length).to.equal(0);

                view.ui.search.val("A");
                view.ui.search.trigger("keyup");
                expect(view.collection.length).to.equal(1);
            });

        });

    });

});

