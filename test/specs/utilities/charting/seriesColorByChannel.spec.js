requirejs(
[
    "utilities/charting/seriesColorByChannel"
],
function(seriesColorByChannel)
{
    describe("seriesColorByChannel", function()
    {
        it("should be a valid object", function()
        {
            expect(seriesColorByChannel).toBeDefined();
        });
    });
});