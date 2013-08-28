// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "TP",
    "dashboard/reportingDataManager",
    "dashboard/charts/peaksChart"
],
function(
    TP,
    ReportingDataManager,
    PeaksChart
    )
{
    describe("PeaksChart", function()
    {

        it("should automatically initialize comparisonDateOptions", function()
        {
            var chart = new PeaksChart({chartType: 8}, {dataManager: new ReportingDataManager() });
            var comparisonDateOptions = chart.get("comparisonDateOptions");

            expect(comparisonDateOptions.startDate).toBe(null);
            expect(comparisonDateOptions.endDate).toBe(null);
            expect(comparisonDateOptions.quickDateSelectOption).toBe(1);
        });

    });
});
