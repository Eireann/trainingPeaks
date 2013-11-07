define(
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
            expect(GraphView).to.not.be.undefined;
            expect(function() { new GraphView({ model: new TP.Model({ detailData: new TP.Model() }), detailDataPromise: {} }); }).to.not.throw();
        });
    });
});
