define(
[
    "utilities/charting/chartColors"
],
function(chartColors)
{
    describe("seriesColorByChannel", function()
    {
        it("should be a valid object", function()
        {
            expect(chartColors).to.not.be.undefined;
            expect(chartColors.seriesColorByChannel).to.not.be.undefined;
        });
    });
});
