requirejs(
[
    "jquery",
    "TP",
    "moment",
    "views/expando/graphView"
],
function($, TP, moment, GraphView)
{
    describe("GraphView", function()
    {
        it("Should have a valid contructor", function()
        {
            expect(GraphView).toBeDefined();
            expect(function() { new GraphView({ model: new TP.Model({ detailData: new TP.Model() }), detailDataPromise: {} }); }).not.toThrow();
        });
    });
});
