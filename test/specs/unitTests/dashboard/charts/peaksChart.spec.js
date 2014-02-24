define(
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

            expect(comparisonDateOptions.startDate).to.equal(null);
            expect(comparisonDateOptions.endDate).to.equal(null);
            expect(comparisonDateOptions.quickDateSelectOption).to.equal(1);
        });

    });
});
