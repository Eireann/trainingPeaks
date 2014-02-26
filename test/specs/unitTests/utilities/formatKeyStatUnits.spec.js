require(
[
    "TP",
    "testUtils/testHelpers"
],
function(TP, testHelpers)
{
    describe("Display key stat unit for distance, time, or tss", function()
    {

        beforeEach(function()
        {
            testHelpers.theApp.user.set("units", TP.utils.units.constants.English);
        });

        afterEach(function()
        {
            testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
        });

        it("Should display a completed workout of backbone model with the precendent of distance, duration, and tss", function()
        {
            var workout = new TP.Model();
            workout.set({ distance: 20, totalTime: 1, tssActual: 100, distancePlanned: 20, totalTimePlanned: 1, tssPlanned: 100 });
            expect(TP.utils.workout.keyStat.formatUnits(workout)).to.equal("mi");

            workout.set("distance", null);
            expect(TP.utils.workout.keyStat.formatUnits(workout)).to.equal("");

            workout.set("totalTime", null);
            expect(TP.utils.workout.keyStat.formatUnits(workout)).to.equal("TSS");
            
            workout.set("tssActual", null);
            expect(TP.utils.workout.keyStat.formatUnits(workout)).to.equal("mi");

            workout.set("distancePlanned", null);
            expect(TP.utils.workout.keyStat.formatUnits(workout)).to.equal("");

            workout.set("totalTimePlanned", null);
            expect(TP.utils.workout.keyStat.formatUnits(workout)).to.equal("TSS");

            workout.set("tssPlanned", null);
            expect(TP.utils.workout.keyStat.formatUnits(workout)).to.equal("");
            

        });
        
        
        it("Should accept a JSON object", function ()
        {
            var workout = { distance: 20, totalTime: 1, tssActual: 100 };
            expect(TP.utils.workout.keyStat.formatUnits(workout)).to.equal("mi");
        });
        
        
    });
});
