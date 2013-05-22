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
    });
});