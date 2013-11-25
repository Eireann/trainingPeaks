define(
[
    "utilities/charting/dataParser",
    "utilities/charting/graphData",
    "./dataParserTestData"
],
function(DataParser, GraphData, testData)
{
    describe("FlotUtils class", function()
    {
        describe("Takes a flatSamples parameter and processes the data to be usable by Flot", function()
        {
            var dataParser, graphData, expectedLength, minTemperature, minElevation, minElevationOnRange, expectedLatLonLength;
            before(function()
            {
                graphData = new GraphData({ detailData: {} });
                dataParser = new DataParser({graphData: graphData});
                dataParser.loadData(testData);

                // We do not save Lat, Lon, or Distance in the series object.
                expectedLength = testData.channelMask.length;
                _.each(testData.channelMask, function (channel)
                {
                    if (channel === "Latitude" || channel === "Longitude" || channel === "Distance")
                        expectedLength--;
                });

                minTemperature = -20;
                minElevation = 1617.39;
                minElevationOnRange = 1675.39;

                // Test data contains NaNs in the Lat Lon array. Those get thrown out, don't count towards total.
                expectedLatLonLength = 8275;
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
