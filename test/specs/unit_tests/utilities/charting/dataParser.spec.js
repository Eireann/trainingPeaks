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
            var gd = new GraphData();
            var dp = new DataParser({graphData: gd});
            expect(DataParser.prototype.loadData).to.not.be.undefined;
            expect(function()
            {
                dp.loadData(testData);
            }).to.not.throw();
        });
    });
});
