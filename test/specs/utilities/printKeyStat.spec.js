require(
[
    "TP",
    "utilities/printKeyStat"
],
function(TP, printKeyStat)
{
    describe("Display workout distance, time, or tss", function()
    {
        it("Should display a completed workout of backbone model with the precendent of distance, duration, and tss", function()
        {
            var workout = new TP.Model();
            workout.set({ distance: 20, totalTime: 1, tssActual: 100, distancePlanned: 20, totalTimePlanned: 1, tssPlanned: 100 });
            expect(printKeyStat(workout)).toBe("0.01");

            workout.set("distance", null);
            expect(printKeyStat(workout)).toBe("1:00:00");
            
            workout.set("totalTime", null);
            expect(printKeyStat(workout)).toBe(100);
            
            workout.set("tssActual", null);
            expect(printKeyStat(workout)).toBe("0.01");

            workout.set("distancePlanned", null);
            expect(printKeyStat(workout)).toBe("1:00:00");

            workout.set("totalTimePlanned", null);
            expect(printKeyStat(workout)).toBe(100);

            workout.set("tssPlanned", null);
            expect(printKeyStat(workout)).toBe("");
 

        });
        
        it("Should accept a JSON object", function ()
        {
            var workout = { distance: 20, totalTime: 1, tssActual: 100 };
            expect(printKeyStat(workout)).toBe("0.01");
        });
        
        
    });
});