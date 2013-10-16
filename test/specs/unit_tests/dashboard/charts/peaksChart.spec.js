// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "TP",
    "framework/dataManager",
    "dashboard/charts/peaksChart"
],
function(
    TP,
    DataManager,
    PeaksChart
)
{

    describe("PeaksChart", function()
    {

        it("should automatically initialize comparisonDateOptions", function()
        {
            var chart = new PeaksChart({chartType: 8}, {dataManager: new DataManager() });
            var comparisonDateOptions = chart.get("comparisonDateOptions");

            expect(comparisonDateOptions.startDate).toBe(null);
            expect(comparisonDateOptions.endDate).toBe(null);
            expect(comparisonDateOptions.quickDateSelectOption).toBe(1);
        });

    });
});
