require(
[
    "TP",
    "testUtils/testHelpers"
],
function(TP, testHelpers)
{
    describe("Display key stat distance, time, or tss", function()
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

            // distance
            expect(TP.utils.workout.keyStat.formatStats(workout)).to.equal("0.01");

            // duration
            workout.set("distance", null);
            expect(TP.utils.workout.keyStat.formatStats(workout)).to.equal("1:00:00");
           
            // tss 
            workout.set("totalTime", null);
            expect(TP.utils.workout.keyStat.formatStats(workout)).to.equal("100.0");
           
            // distance 
            workout.set("tssActual", null);
            expect(TP.utils.workout.keyStat.formatStats(workout)).to.equal("0.01");

            // duration
            workout.set("distancePlanned", null);
            expect(TP.utils.workout.keyStat.formatStats(workout)).to.equal("1:00:00");

            // tss
            workout.set("totalTimePlanned", null);
            expect(TP.utils.workout.keyStat.formatStats(workout)).to.equal("100.0");

            workout.set("tssPlanned", null);
            expect(TP.utils.workout.keyStat.formatStats(workout)).to.equal("");
 

        });

        it("Should accept a JSON object", function()
        {
            // by distance
            var workout = { distance: 20, totalTime: 1, tssActual: 100 };
            expect(TP.utils.workout.keyStat.formatStats(workout)).to.equal("0.01");
        });
        
        
    });
});
