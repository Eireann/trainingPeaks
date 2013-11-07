define(
[
    "jquery",
    "TP",
    "moment",
    "utilities/charting/jquery.flot.filter"
],
function($, TP, moment, flotFilter)
{
    describe("Flot Smoothing Filter", function()
    {
        it("has the following methods", function()
        {
            expect(typeof flotFilter.applyDataFilter).to.equal("function");
            expect(typeof flotFilter.computeSumsOverPeriod).to.equal("function");
            expect(typeof flotFilter.computeSimpleMovingAverages).to.equal("function");
            expect(typeof flotFilter.computeExponentialMovingAverages).to.equal("function");
        });

        it("has a setFilter method", function()
        {
            expect(typeof flotFilter.setFilter).to.equal("function");

            var plot =
            {
                options:
                {
                    filter:
                    {
                        enabled: null,
                        period: null
                    }
                },
                getOptions: function()
                {
                    return plot.options;
                },
                getData: function()
                {
                    
                },
                setData: function()
                {
                    
                },
                draw: function()
                {
                    
                }
            };

            sinon.stub(plot, "draw");

            flotFilter.setFilter(plot, 10);
            expect(plot.options.filter.enabled).to.equal(true);
            expect(plot.options.filter.period).to.equal(10);
            expect(plot.draw).to.have.been.called;
        });

        it("has a way to calculate sums over a period on time series data", function()
        {
            var timeSeriesData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            // Period = 3
            var expectedSums = [6, 9, 12, 15, 18, 21, 24, 27, null, null];

            var actualSums = flotFilter.computeSumsOverPeriod(timeSeriesData, 3);
            expect(actualSums).to.eql(expectedSums);

            // Period = 9
            expectedSums = [45, 54, null, null, null, null, null, null, null, null];
            actualSums = flotFilter.computeSumsOverPeriod(timeSeriesData, 9);
            expect(actualSums).to.eql(expectedSums);

            // Period = 10
            expectedSums = [55, null, null, null, null, null, null, null, null, null];
            actualSums = flotFilter.computeSumsOverPeriod(timeSeriesData, 10);
            expect(actualSums).to.eql(expectedSums);

            // Period = 20
            expectedSums = [null, null, null, null, null, null, null, null, null, null];
            actualSums = flotFilter.computeSumsOverPeriod(timeSeriesData, 20);
            expect(actualSums).to.eql(expectedSums);
        });

        it("has a way to calculate a simple moving average over a period on time series data", function()
        {
            var timeSeriesData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            
            // Period 3
            var expectedAverages = [2, 3, 4, 5, 6, 7, 8, 9, null, null];
            var actualAverages = flotFilter.computeSimpleMovingAverages(timeSeriesData, 3);
            expect(actualAverages).to.eql(expectedAverages);

            // Period 9
            expectedAverages = [5, 6, null, null, null, null, null, null, null, null];
            actualAverages = flotFilter.computeSimpleMovingAverages(timeSeriesData, 9);
            expect(actualAverages).to.eql(expectedAverages);

            // Period 10
            expectedAverages = [5.5, null, null, null, null, null, null, null, null, null];
            actualAverages = flotFilter.computeSimpleMovingAverages(timeSeriesData, 10);
            expect(actualAverages).to.eql(expectedAverages);

            // Period = 20
            expectedAverages = [null, null, null, null, null, null, null, null, null, null];
            actualAverages = flotFilter.computeSimpleMovingAverages(timeSeriesData, 20);
            expect(actualAverages).to.eql(expectedAverages);
        });

        it("has a way to calculate exponential moving averages over a period on time series data", function ()
        {
            var timeSeriesData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            // Period 3
            var expectedAverages = [1, 2, 3, 3, 4, 5, 6, 7, 8, 9 ];
            var actualAverages = flotFilter.computeExponentialMovingAverages(timeSeriesData, 3);
            expect(actualAverages).to.eql(expectedAverages);

            // Period 9
            expectedAverages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 6];
            actualAverages = flotFilter.computeExponentialMovingAverages(timeSeriesData, 9);
            expect(actualAverages).to.eql(expectedAverages);

            // Period 10
            expectedAverages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            actualAverages = flotFilter.computeExponentialMovingAverages(timeSeriesData, 10);
            expect(actualAverages).to.eql(expectedAverages);

            // Period = 20
            expectedAverages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            actualAverages = flotFilter.computeExponentialMovingAverages(timeSeriesData, 20);
            expect(actualAverages).to.eql(expectedAverages);
        });
    });
});
