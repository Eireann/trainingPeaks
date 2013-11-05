define(
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
            expect(ChartTileView).to.not.be.undefined;
        });

        describe("draggability", function()
        {
            var model, view;

            beforeEach(function()
            {
                model = new TP.Model({ chartType: 42 });
                view = new ChartTileView({ model: model });
            });

            it("Should be made draggable when rendered", function()
            {
                sinon.spy(view.$el, "draggable");
                view.render();
                expect(view.$el.draggable).to.have.been.called;
            });

            it("Should add data attributes to $el for dragging", function()
            {
                view.render();

                var data = view.$el.data();
                expect(data.model).to.eql(model);
            });

        });

    });

});

