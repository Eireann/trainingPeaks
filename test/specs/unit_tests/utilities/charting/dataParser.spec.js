define(
[
    "utilities/charting/dataParser",
    "utilities/charting/graphData",
    "./dataParserTestData"
],
function(DataParser, GraphData, testData)
{
    describe("DataParser class", function()
    {
        it("has a loadData method", function()
        {
            var graphData = new GraphData({ detailData: {} });
            var dataParser = new DataParser({ graphData: graphData });
            expect(DataParser.prototype.loadData).to.not.be.undefined;
            expect(function()
            {
                dataParser.loadData(testData);
            }).to.not.throw();
        });
    });
});
