define(
[
    "utilities/charting/dataParser",
    "utilities/charting/dataParserUtils",
    "utilities/charting/graphData",
    "./dataParserTestData"
],
function(
         DataParser,
         DataParserUtils,
         GraphData,
         testData
         )
{
    describe("FlotUtils class", function()
    {
        describe("Takes a flatSamples parameter and processes the data to be usable by Flot", function()
        {
            var dataParser, graphData, minTemperature, minElevation;
            before(function()
            {

                // convert to old format 
                var flatSamples = DataParserUtils.convertFlatSamplesToOldFormat(testData.flatSamples);

                graphData = new GraphData({ detailData: {} });
                dataParser = new DataParser({graphData: graphData});
                dataParser.loadData(flatSamples);

                minTemperature = -20;
                minElevation = 1512;

            });

            after(function()
            {
                dataParser = null;
                graphData = null;
            });


            it("generates yAxes for the entire series", function()
            {
                var yaxes = graphData.getYAxes(graphData.getSeries());
                expect(yaxes).to.not.equal(null);
                expect(yaxes.length).to.be.greaterThan(0);
                _.each(yaxes, function(yaxis)
                {
                    expect(yaxis.show).to.equal(true);
                    expect(yaxis.min).to.not.be.undefined;
                    expect(yaxis.label).to.not.be.undefined;

                    if (yaxis.label === "Elevation")
                        expect(yaxis.min).to.equal(minElevation);
                    else if(yaxis.label === "Temperature")
                        expect(yaxis.min).to.equal(minTemperature);
                    else
                        expect(yaxis.min).to.equal(0);

                    expect(yaxis.position).to.not.be.undefined;
                    expect(yaxis.color).to.not.be.undefined;
                    expect(yaxis.tickColor).to.not.be.undefined;
                    expect(yaxis.font).to.not.be.undefined;
                });
            });

            it("generates yAxes for a range in the series", function ()
            {
                var yaxes = graphData.getYAxes(graphData.getSeries(3600000, 4000000));

                expect(yaxes).to.not.equal(null);
                _.each(yaxes, function (yaxis)
                {
                    expect(yaxis.show).to.equal(true);
                    expect(yaxis.min).to.not.be.undefined;
                    expect(yaxis.label).to.not.be.undefined;

                    if (yaxis.label === "Elevation")
                        expect(yaxis.min).to.equal(minElevation);
                    else if(yaxis.label === "Temperature")
                        expect(yaxis.min).to.equal(minTemperature);
                    else
                        expect(yaxis.min).to.equal(0);

                    expect(yaxis.position).to.not.be.undefined;
                    expect(yaxis.color).to.not.be.undefined;
                    expect(yaxis.tickColor).to.not.be.undefined;
                    expect(yaxis.font).to.not.be.undefined;
                });
            });
        });
    });
});
