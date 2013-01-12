define(
[
    "controllers/sampleController"
],
function(SampleController)
{
    describe("View Test", function()
    {
        it("should be a tautology", function()
        {
            var controller = new SampleController();
            expect(typeof controller.initialize).toBe("function");
        });
    });
});