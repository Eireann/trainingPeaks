define(
[
    "utilities/charting/dataParserUtils",
    "utilities/charting/graphData",
    "testUtils/AppTestData/GET_DetailData_139251189"
],
function(
         DataParserUtils,
         GraphData,
         testData
         )
{
    describe("GraphData class", function()
    {
        describe("Takes a flatSamples parameter and processes the data to be usable by Flot", function()
        {
            var graphData, flatSamples, expectedLength, minElevation, expectedLatLonLength;
            before(function()
            {
                flatSamples = testData.flatSamples;

                graphData = new GraphData({ detailData: {} });
                graphData.loadData(flatSamples);

                // We do not save MillisecondOffset, Lat, Lon, or Distance in the series object.
                expectedLength = flatSamples.channels.length - 4;

                minElevation = 1512;

                // Test data contains NaNs in the Lat Lon array. Those get thrown out, don't count towards total.
                expectedLatLonLength = 1220;
            });

            after(function()
            {
                graphData = null;
            });

            it("has a getSeries method which returns the entire series data", function ()
            {
                var series = graphData.getSeries();

                expect(series.length).to.equal(expectedLength);
                _.each(series, function(channel)
                {
                    expect(channel.data.length).to.equal(flatSamples.channels[0].samples.length);
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

            it("returns elevation info for a given range based on x1 and x2 milliseconds offset into the series", function()
            {
                var minValue = graphData.getMinimumForAxis("Elevation");
                expect(minValue).to.equal(minElevation);
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
