// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "views/charts/timeInZonesChart"
],
function(_, TimeInZonesChartView)
{
    describe("Base TimeInZonesChartView", function()
    {
        it("Should have a valid constructor", function()
        {
            expect(TimeInZonesChartView).toBeDefined();
        });

        it("Should check for valid initialization parameters", function()
        {
            
        });
    });
});