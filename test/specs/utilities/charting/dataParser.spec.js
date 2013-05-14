requirejs(
[
    "utilities/charting/dataParser",
    "../test/specs/utilities/charting/dataParserTestData"
],
function(DataParser, testData)
{
    describe("DataParser class", function()
    {

        it("has a constructor", function ()
        {
            expect(typeof DataParser).toBe("function");
            expect(new DataParser()).toBeDefined();
            expect(function() { new DataParser(); }).not.toThrow();

            var dp = new DataParser();

            expect(dp.flatSamples).toBe(null);
            expect(dp.dataByChannel).toBe(null);
        });

        describe("Takes a flatSamples parameter and processes the data to be usable by Flot", function()
        {
            var dp = new DataParser();
            // We do not save Lat, Lon, or Distance in the series object.
            var expectedLength = testData.channelMask.length;
            _.each(testData.channelMask, function (channel)
            {
                if (channel === "Latitude" || channel === "Longitude" || channel === "Distance")
                    expectedLength--;
            });

            var minElevation = 1617.39;
            var minElevationOnRange = 1675.39;

            // Test data contains NaNs in the Lat Lon array. Those get thrown out, don't count towards total.
            var expectedLatLonLength = 8275;
            
            it("has a loadData method", function()
            {
                expect(DataParser.prototype.loadData).toBeDefined();
                expect(function()
                {
                    dp.loadData(testData);
                }).not.toThrow();
            });

            it("has a getSeries method which returns the entire series data", function ()
            {
                var series = dp.getSeries();

                expect(series.length).toBe(expectedLength);
                _.each(series, function(channel)
                {
                    expect(channel.data.length).toBe(testData.samples.length);
                    expect(channel.color).toBeDefined();
                    expect(channel.label).toBeDefined();
                    expect(channel.lines).toBeDefined();
                    expect(channel.shadowSize).toBeDefined();
                });
            });

            it("has a getSeries method which takes an x1 and x2 millisecond offset into the series and returns a slice of the series", function()
            {
                var slice = dp.getSeries(0, 3600000);

                expect(slice.length).toBe(expectedLength);
                _.each(slice, function (channel)
                {
                    expect(channel.color).toBeDefined();
                    expect(channel.label).toBeDefined();
                    expect(channel.lines).toBeDefined();
                    expect(channel.shadowSize).toBeDefined();
                });

                slice = dp.getSeries(3600000, 4000000);
                expect(slice.length).toBe(expectedLength);
                _.each(slice, function (channel) {
                    expect(channel.color).toBeDefined();
                    expect(channel.label).toBeDefined();
                    expect(channel.lines).toBeDefined();
                    expect(channel.shadowSize).toBeDefined();
                });
            });

            it("returns elevation info for the entire series", function()
            {
                var info = dp.getElevationInfo();
                expect(info.min).toBeDefined();
                expect(info.isAllNegative).toBeDefined();
                expect(info.min).toBe(minElevation);
                expect(info.isAllNegative).toBe(false);
            });

            it("returns elevation info for a given range based on x1 and x2 milliseconds offset into the series", function()
            {
                var info = dp.getElevationInfo(0, 3600000);
                expect(info.min).toBeDefined();
                expect(info.isAllNegative).toBeDefined();
                expect(info.min).toBe(minElevationOnRange);
                expect(info.isAllNegative).toBe(false);
            });

            it("returns a latLong array for the entire series", function()
            {
                var latLonArray = dp.getLatLonArray();
                expect(latLonArray).not.toBe(null);
                expect(latLonArray.length).toBe(expectedLatLonLength);
            });

            it("generates yAxes for the entire series", function()
            {
                var yaxes = dp.getYAxes(dp.getSeries());
                expect(yaxes).not.toBe(null);
                _.each(yaxes, function(yaxis)
                {
                    expect(yaxis.show).toBe(true);
                    expect(yaxis.min).toBeDefined();
                    expect(yaxis.label).toBeDefined();
                    
                    if (yaxis.label === "Elevation")
                        expect(yaxis.min).toBe(minElevation);
                    else
                        expect(yaxis.min).toBe(0);

                    expect(yaxis.position).toBeDefined();
                    expect(yaxis.color).toBeDefined();
                    expect(yaxis.tickColor).toBeDefined();
                    expect(yaxis.font).toBeDefined();
                });
            });

            it("generates yAxes for a range in the series", function ()
            {
                var yaxes = dp.getYAxes(dp.getSeries(3600000, 4000000));
                
                expect(yaxes).not.toBe(null);
                _.each(yaxes, function (yaxis)
                {
                    expect(yaxis.show).toBe(true);
                    expect(yaxis.min).toBeDefined();
                    expect(yaxis.label).toBeDefined();

                    if (yaxis.label === "Elevation")
                        expect(yaxis.min).toBe(minElevation);
                    else
                        expect(yaxis.min).toBe(0);

                    expect(yaxis.position).toBeDefined();
                    expect(yaxis.color).toBeDefined();
                    expect(yaxis.tickColor).toBeDefined();
                    expect(yaxis.font).toBeDefined();
                });
            });
        });
    });
});