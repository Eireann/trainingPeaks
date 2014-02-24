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

        describe("Range Selection", function()
        {
            describe("_findStartAndEndOffsetOfSelection", function()
            {
                var view;
                beforeEach(function()
                {
                    view = new GraphView({
                        detailDataPromise: new $.Deferred(),
                        model: new TP.Model({
                            detailData: new TP.Model(),
                            details: new TP.Model()
                        })
                    });

                    sinon.stub(view, "_getGraphData").returns({
                        getMsOffsetOfLastSample: function() { return 100000; },
                        getMsOffsetFromDistance: function(distance) { return distance * 1000; }
                    });

                    sinon.stub(view, "_getMSWidthOfOnePlotPixel").returns(1000);
                });

                it("Should use the time offsets calculated by flot if current axis is time", function()
                {
                    var offsets = view._findStartAndEndOffsetOfSelection(5000, 25000);
                    expect(offsets.start).to.eql(5000);
                    expect(offsets.end).to.eql(25000);
                });

                it("Should use graphData to find ms offsets of distances", function()
                {
                    view.currentAxis = "distance";
                    var offsets = view._findStartAndEndOffsetOfSelection(10, 20);
                    expect(offsets.start).to.eql(10 * 1000);
                    expect(offsets.end).to.eql(20 * 1000);
                });

                it("Should snap selection to end if it is within one pixel width", function()
                {
                    var offsets = view._findStartAndEndOffsetOfSelection(1000, 99000);
                    expect(offsets.start).to.eql(1000);
                    expect(offsets.end).to.eql(100000);
                });

                it("Should not snap selection to end if it is not within one pixel width", function()
                {
                    var offsets = view._findStartAndEndOffsetOfSelection(1000, 98999);
                    expect(offsets.start).to.eql(1000);
                    expect(offsets.end).to.eql(98999);
                });

            });
        });
    });
});
