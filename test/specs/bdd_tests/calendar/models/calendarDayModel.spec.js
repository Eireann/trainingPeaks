define(
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
            expect(CalendarDay).to.not.be.undefined;
        });

        it("should use date as id", function()
        {
            var theDay = '2012-01-01';
            var calendarDay = new CalendarDay({ date: theDay });
            expect(calendarDay.id).to.eql(theDay);

        });

        describe("Set Workout", function()
        {
            it("Should allow to add and retrieve a workout", function()
            {
                var calendarDay = new CalendarDay({ date: "2011-03-02" });
                var workout = new WorkoutModel({ workoutDay: "2011-03-02T00:00:00", workoutId: "12345" });
                calendarDay.add(workout);
                var workouts = calendarDay.itemsCollection;
                expect(workouts).to.not.be.null;
                expect(workouts.get("Workout:" + workout.id)).to.equal(ActivityModel.wrap(workout));
            });

        });

    });

});
