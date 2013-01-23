// use requirejs() here, not define(), for jasmine compatibility
requirejs(
["models/calendarDay"],
function(CalendarDay)
{
    describe("Calendar Day Model", function()
    {
        it("should load as a module", function()
        {
            expect(CalendarDay).toBeDefined();
        });

        describe("Set Workout", function()
        {
            it("Should allow to set and get a workout", function()
            {
                var workout = {};
                var calendar = new CalendarDay();
                calendar.setWorkout(workout);
                expect(calendar.getWorkout()).toBe(workout);
            });
        });

    });

});