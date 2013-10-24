// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "models/workoutModel",
    "shared/models/activityModel",
    "models/calendar/calendarDay"
],
function(
    testHelpers,
    xhrData,
    WorkoutModel,
    ActivityModel,
    CalendarDay)
{
    describe("Calendar Day Model", function()
    {

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

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
                var workout = new WorkoutModel({ workoutDay: "2011-03-02T00:00:00", workoutId: "12345" });
                calendarDay.add(workout);
                var workouts = calendarDay.itemsCollection;
                expect(workouts).not.toBeNull();
                expect(workouts.get("Workout:" + workout.id)).toBe(ActivityModel.wrap(workout));
            });

        });

    });

});
