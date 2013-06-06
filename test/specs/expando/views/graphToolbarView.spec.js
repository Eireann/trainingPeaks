requirejs(
[
    "jquery",
    "TP",
    "moment",
    "app",
    "views/expando/graphToolbarView"
],
function($, TP, moment, theMarsApp, GraphToolbarView)
{
    describe("GraphToolbarView", function()
    {
        it("Should have a valid contructor", function()
        {
            expect(GraphToolbarView).toBeDefined();
            expect(function() { new GraphToolbarView({ dataParser: null }); }).not.toThrow();
        });

        it("Should trigger an event when the slider bar changes value", function()
        {
            var view = new GraphToolbarView({ dataParser: null });
            view.onRender = function()
            {
            };
            view.render();

            var called = false;
            var period = null;
            view.on("filterPeriodChanged", function(p)
            {
                called = true;
                period = p;
            });

            runs(function()
            {
                view.$("input[name=filterPeriod]").val(50).change();
            });

            waitsFor(function () { return called; }, 5000);

            runs(function()
            {
                expect(called).toBe(true);
                expect(period).toBe(50);
            });
        });
    });
});