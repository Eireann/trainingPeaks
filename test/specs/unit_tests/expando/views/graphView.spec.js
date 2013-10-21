requirejs(
[
    "jquery",
    "TP",
    "moment",
    "app",
    "views/expando/graphView"
],
function($, TP, moment, theMarsApp, GraphView)
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