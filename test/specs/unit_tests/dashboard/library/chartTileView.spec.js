// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "TP",
    "views/dashboard/library/chartTileView"
],
function(TP, ChartTileView)
{

    describe("ChartTileView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(ChartTileView).toBeDefined();
        });

        describe("draggability", function()
        {
            var view;

            beforeEach(function()
            {
                var model = new TP.Model({ chartType: 42 });
                view = new ChartTileView({ model: model });
            });

            it("Should be made draggable when rendered", function()
            {
                spyOn(view.$el, "draggable").andCallThrough();
                view.render();
                expect(view.$el.draggable).toHaveBeenCalled();
            });

            it("Should add data attributes to $el for dragging", function()
            {
                view.render();

                var data = view.$el.data();
                expect(data.ItemType).toEqual("Chart");
                expect(data.ChartType).toEqual(42);
            });

        });

    });

});

