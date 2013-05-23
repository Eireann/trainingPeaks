requirejs(
[
    "jquery",
    "TP",
    "moment",
    "app",
    "utilities/charting/jquery.flot.filter"
],
function($, TP, moment, theMarsApp, flotFilter)
{
    describe("Flot Smoothing Filter", function()
    {
        it("has the following methods", function()
        {
            expect(typeof flotFilter.applyDataFilter).toBe("function");
            expect(typeof flotFilter.computeSumsOverPeriod).toBe("function");
            expect(typeof flotFilter.computeSimpleMovingAverages).toBe("function");
            expect(typeof flotFilter.computeExponentialMovingAverages).toBe("function");
        });

        it("has a setFilter method", function()
        {
            expect(typeof flotFilter.setFilter).toBe("function");

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

            spyOn(plot, "draw");

            flotFilter.setFilter(plot, 10);
            expect(plot.options.filter.enabled).toBe(true);
            expect(plot.options.filter.period).toBe(10);
            expect(plot.draw).toHaveBeenCalled();
        });

        it("has a way to calculate sums over a period on time series data", function()
        {
            var timeSeriesData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            // Period = 3
            var expectedSums = [6, 9, 12, 15, 18, 21, 24, 27, null, null];

            var actualSums = flotFilter.computeSumsOverPeriod(timeSeriesData, 3);
            expect(actualSums).toEqual(expectedSums);

            // Period = 9
            expectedSums = [45, 54, null, null, null, null, null, null, null, null];
            actualSums = flotFilter.computeSumsOverPeriod(timeSeriesData, 9);
            expect(actualSums).toEqual(expectedSums);

            // Period = 10
            expectedSums = [55, null, null, null, null, null, null, null, null, null];
            actualSums = flotFilter.computeSumsOverPeriod(timeSeriesData, 10);
            expect(actualSums).toEqual(expectedSums);

            // Period = 20
            expectedSums = [null, null, null, null, null, null, null, null, null, null];
            actualSums = flotFilter.computeSumsOverPeriod(timeSeriesData, 20);
            expect(actualSums).toEqual(expectedSums);
        });

        it("has a way to calculate a simple moving average over a period on time series data", function()
        {
            var timeSeriesData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            
            // Period 3
            var expectedAverages = [2, 3, 4, 5, 6, 7, 8, 9, null, null];
            var actualAverages = flotFilter.computeSimpleMovingAverages(timeSeriesData, 3);
            expect(actualAverages).toEqual(expectedAverages);

            // Period 9
            expectedAverages = [5, 6, null, null, null, null, null, null, null, null];
            actualAverages = flotFilter.computeSimpleMovingAverages(timeSeriesData, 9);
            expect(actualAverages).toEqual(expectedAverages);

            // Period 10
            expectedAverages = [5.5, null, null, null, null, null, null, null, null, null];
            actualAverages = flotFilter.computeSimpleMovingAverages(timeSeriesData, 10);
            expect(actualAverages).toEqual(expectedAverages);

            // Period = 20
            expectedAverages = [null, null, null, null, null, null, null, null, null, null];
            actualAverages = flotFilter.computeSimpleMovingAverages(timeSeriesData, 20);
            expect(actualAverages).toEqual(expectedAverages);
        });

        it("has a way to calculate exponential moving averages over a period on time series data", function ()
        {
            var timeSeriesData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            // Period 3
            var expectedAverages = [null, null, 2, 3, 4, 5, 6, 7, 8, 9 ];
            var actualAverages = flotFilter.computeExponentialMovingAverages(timeSeriesData, 3);
            expect(actualAverages).toEqual(expectedAverages);

            // Period 9
            expectedAverages = [null, null, null, null, null, null, null, null, 5, 6];
            actualAverages = flotFilter.computeExponentialMovingAverages(timeSeriesData, 9);
            expect(actualAverages).toEqual(expectedAverages);

            // Period 10
            expectedAverages = [ null, null, null, null, null, null, null, null, null, 5.5];
            actualAverages = flotFilter.computeExponentialMovingAverages(timeSeriesData, 10);
            expect(actualAverages).toEqual(expectedAverages);

            // Period = 20
            expectedAverages = [null, null, null, null, null, null, null, null, null, null];
            actualAverages = flotFilter.computeExponentialMovingAverages(timeSeriesData, 20);
            expect(actualAverages).toEqual(expectedAverages);
        });
    });
});