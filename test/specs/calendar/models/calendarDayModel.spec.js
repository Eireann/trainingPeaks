// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "models/workoutModel",
    "models/calendarDay"
],
function(WorkoutModel, CalendarDay)
{
    describe("Calendar Day Model", function()
    {
        it("should load as a module", function()
        {
            expect(CalendarDay).toBeDefined();
        });

        it("should use date as id", function()
        {
            var theDay = '2012-01-01';
            var calendarDay = new CalendarDay({ date: theDay });
            expect(calendarDay.id).toEqual(theDay);

        });

        describe("Set Workout", function()
        {
            it("Should allow to add and retrieve a workout", function()
            {
                var calendarDay = new CalendarDay({ date: "2011-03-02" });
                var workout = new WorkoutModel({ WorkoutDay: "2011-03-02T00:00:00" });
                calendarDay.addWorkout(workout);
                var workouts = calendarDay.getWorkouts();
                expect(workouts).not.toBeNull();
                expect(calendarDay.getWorkouts().at(0)).toBe(workout);
            });


            it("Should trigger a change event on add workout", function()
            {
                var changeSpy = jasmine.createSpy("change spy");
                var calendarDay = new CalendarDay({ date: "2011-03-22" });
                var workout = new WorkoutModel({ WorkoutDay: "2011-03-22T00:00:00" });

                calendarDay.bind("change", changeSpy);
                calendarDay.addWorkout(workout);
                expect(changeSpy).toHaveBeenCalled();
            });


        });

    });

});