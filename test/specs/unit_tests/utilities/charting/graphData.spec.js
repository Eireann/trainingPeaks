define(
[
    "utilities/charting/dataParser",
    "utilities/charting/graphData",
    "./dataParserTestData"
],
function(DataParser, GraphData, testData)
{
    describe("GraphData class", function()
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

            it("has a getSeries method which returns the entire series data", function ()
            {
                var series = graphData.getSeries();

                expect(series.length).to.equal(expectedLength);
                _.each(series, function(channel)
                {
                    expect(channel.data.length).to.equal(testData.samples.length);
                    expect(channel.color).to.not.be.undefined;
                    expect(channel.label).to.not.be.undefined;
                    expect(channel.lines).to.not.be.undefined;
                    expect(channel.shadowSize).to.not.be.undefined;
                });
            });

            it("has a getSeries method which takes an x1 and x2 millisecond offset into the series and returns a slice of the series", function()
            {
                var slice = graphData.getSeries(0, 3600000);

                expect(slice.length).to.equal(expectedLength);
                _.each(slice, function (channel)
                {
                    expect(channel.color).to.not.be.undefined;
                    expect(channel.label).to.not.be.undefined;
                    expect(channel.lines).to.not.be.undefined;
                    expect(channel.shadowSize).to.not.be.undefined;
                });

                slice = graphData.getSeries(3600000, 4000000);
                expect(slice.length).to.equal(expectedLength);
                _.each(slice, function (channel) {
                    expect(channel.color).to.not.be.undefined;
                    expect(channel.label).to.not.be.undefined;
                    expect(channel.lines).to.not.be.undefined;
                    expect(channel.shadowSize).to.not.be.undefined;
                });
            });

            it("returns elevation info for the entire series", function()
            {
                var info = graphData.elevationInfo;
                expect(info.min).to.not.be.undefined;
                expect(info.isAllNegative).to.not.be.undefined;
                expect(info.min).to.equal(minElevation);
                expect(info.isAllNegative).to.equal(false);
            });

            it("returns elevation info for a given range based on x1 and x2 milliseconds offset into the series", function()
            {
                var minValue = graphData.getMinimumForAxis("Elevation", graphData.dataByAxisAndChannel["time"], graphData.elevationInfo, 0, 3600000);
                expect(minValue).to.equal(minElevationOnRange);
            });

            it("returns a latLong array for the entire series", function()
            {
                var latLonArray = graphData.getLatLonArray();
                expect(latLonArray).to.not.equal(null);
                expect(latLonArray.length).to.equal(expectedLatLonLength);
            });
        });
    });
});
