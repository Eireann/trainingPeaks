// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "TP",
    "dashboard/charts/peaksChart"
],
function(
    TP,
    PeaksChart
    )
{
    describe("PeaksChart", function()
    {

        it("should automatically initialize comparisonDateOptions", function()
        {
            var fakeDataManager = {};
            var chart = new PeaksChart({chartType: 8}, {dataManager: fakeDataManager});
            var comparisonDateOptions = chart.get("comparisonDateOptions");

            expect(comparisonDateOptions.startDate).toBe(null);
            expect(comparisonDateOptions.endDate).toBe(null);
            expect(comparisonDateOptions.quickDateSelectOption).toBe(1);
        });

    });
});
