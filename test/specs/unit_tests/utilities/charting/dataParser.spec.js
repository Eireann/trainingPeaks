define(
[
    "utilities/charting/dataParser",
    "./dataParserTestData"
],
function(DataParser, testData)
{
    describe("DataParser class", function()
    {

        it("has a constructor", function ()
        {
            expect(typeof DataParser).to.equal("function");
            expect(new DataParser()).to.not.be.undefined;
            expect(function() { new DataParser(); }).to.not.throw();

            var dp = new DataParser();

            expect(dp.flatSamples).to.equal(null);
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

            var minTemperature = -20;
            var minElevation = 1617.39;
            var minElevationOnRange = 1675.39;

            // Test data contains NaNs in the Lat Lon array. Those get thrown out, don't count towards total.
            var expectedLatLonLength = 8275;
            
            it("has a loadData method", function()
            {
                expect(DataParser.prototype.loadData).to.not.be.undefined;
                expect(function()
                {
                    dp.loadData(testData);
                }).to.not.throw();
            });

            it("has a getSeries method which returns the entire series data", function ()
            {
                var series = dp.getSeries();

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
                var slice = dp.getSeries(0, 3600000);

                expect(slice.length).to.equal(expectedLength);
                _.each(slice, function (channel)
                {
                    expect(channel.color).to.not.be.undefined;
                    expect(channel.label).to.not.be.undefined;
                    expect(channel.lines).to.not.be.undefined;
                    expect(channel.shadowSize).to.not.be.undefined;
                });

                slice = dp.getSeries(3600000, 4000000);
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
                var info = dp.getElevationInfo();
                expect(info.min).to.not.be.undefined;
                expect(info.isAllNegative).to.not.be.undefined;
                expect(info.min).to.equal(minElevation);
                expect(info.isAllNegative).to.equal(false);
            });

            it("returns elevation info for a given range based on x1 and x2 milliseconds offset into the series", function()
            {
                var info = dp.getElevationInfo(0, 3600000);
                expect(info.min).to.not.be.undefined;
                expect(info.isAllNegative).to.not.be.undefined;
                expect(info.min).to.equal(minElevationOnRange);
                expect(info.isAllNegative).to.equal(false);
            });

            it("returns a latLong array for the entire series", function()
            {
                var latLonArray = dp.getLatLonArray();
                expect(latLonArray).to.not.equal(null);
                expect(latLonArray.length).to.equal(expectedLatLonLength);
            });

            it("generates yAxes for the entire series", function()
            {
                var yaxes = dp.getYAxes(dp.getSeries());
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
                var yaxes = dp.getYAxes(dp.getSeries(3600000, 4000000));
                
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
