describe("Calendar Day Model spec", function()
{

    // Use 'it("",function(done) ' - this makes jasmine wait for done() to be called,
    // or else some of our tests won't run if requirejs files don't return in time
    it("Loading calendarDay test dependencies via requirejs", function(done)
    {

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

            // have to call done() after our final test
            done();
        });

    });

});