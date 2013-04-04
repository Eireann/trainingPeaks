require(
[
    "TP",
    "utilities/printKeyStatUnits"
],
function(TP, printKeyStatUnits)
{
    describe("Display workout distance, time, or tss", function()
    {
        it("Should display a completed workout of backbone model with the precendent of distance, duration, and tss", function()
        {
            var workout = new TP.Model();
            workout.set({ distance: 20, totalTime: 1, tssActual: 100, distancePlanned: 20, totalTimePlanned: 1, tssPlanned: 100 });
            expect(printKeyStatUnits(workout)).toBe("mi");

            workout.set("distance", null);
            expect(printKeyStatUnits(workout)).toBe("");

            workout.set("totalTime", null);
            expect(printKeyStatUnits(workout)).toBe("TSS");
            
            workout.set("tssActual", null);
            expect(printKeyStatUnits(workout)).toBe("mi");

            workout.set("distancePlanned", null);
            expect(printKeyStatUnits(workout)).toBe("");

            workout.set("totalTimePlanned", null);
            expect(printKeyStatUnits(workout)).toBe("TSS");

            workout.set("tssPlanned", null);
            expect(printKeyStatUnits(workout)).toBe("");
            

        });
        
        
        it("Should accept a JSON object", function ()
        {
            var workout = { distance: 20, totalTime: 1, tssActual: 100 };
            expect(printKeyStatUnits(workout)).toBe("mi");
        });
        
        
    });
});