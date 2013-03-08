require(
[
    "TP",
    "utilities/printKeyStat"
],
function(TP, printKeyStat)
{
    describe("Display workout distance, time, or tss", function()
    {
        it("Should display a backbone model with the precendent of workout distance, duration, and tss", function()
        {
            var workout = new TP.Model();
            workout.set({ distance: 20, totalTime: 1, tssActual: 100 });
            expect(printKeyStat(workout)).toBe("0.01 mi");

            workout.set("distance", null);
            expect(printKeyStat(workout)).toBe("01:00");
            
            workout.set("totalTime", null);
            expect(printKeyStat(workout)).toBe("100 tss");
            
            workout.set("tssActual", null);
            expect(printKeyStat(workout)).toBe("");
        });
        
        it("Should display a JSON object with the precendent of workout distance, duration, and tss", function ()
        {
            var workout = { distance: 20, totalTime: 1, tssActual: 100 };
            expect(printKeyStat(workout)).toBe("0.01 mi");

            workout.distance = null;
            expect(printKeyStat(workout)).toBe("01:00");

            workout.totalTime = null;
            expect(printKeyStat(workout)).toBe("100 tss");

            workout.tssActual = null;
            expect(printKeyStat(workout)).toBe("");
        });
    });
});