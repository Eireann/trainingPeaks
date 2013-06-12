requirejs(
[
    "utilities/charting/chartColors"
],
function(chartColors)
{
    describe("seriesColorByChannel", function()
    {
        it("should be a valid object", function()
        {
            expect(chartColors).toBeDefined();
            expect(chartColors.seriesColorByChannel).toBeDefined();
        });
    });
});