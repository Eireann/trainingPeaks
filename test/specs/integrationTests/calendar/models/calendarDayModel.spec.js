define(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "models/workoutModel",
    "shared/models/metricModel",
    "shared/models/activityModel",
    "models/calendar/calendarDay"
],
function(
    testHelpers,
    xhrData,
    WorkoutModel,
    MetricModel,
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

        describe("Sorting", function()
        {

            it("Should sort all items by timestamp", function()
            {
                var calendarDay = new CalendarDay({ date: "2011-03-02" });

                var workout1 = new WorkoutModel({ workoutDay: "2011-03-02T00:00:00", startTime: "2011-03-02T08:00:00", workoutId: "12345" });
                calendarDay.add(workout1);

                var workout2 = new WorkoutModel({ workoutDay: "2011-03-02T00:00:00", startTimePlanned: "2011-03-02T06:00:00", workoutId: "23456" });
                calendarDay.add(workout2);

                var metric = new MetricModel({ timeStamp: "2011-03-02T07:00:00", id: "12345" });
                calendarDay.add(metric);

                var items = calendarDay.itemsCollection;
                expect(items).to.not.be.null;

                expect(items.at(0)).to.equal(ActivityModel.wrap(workout2));
                expect(items.at(1)).to.equal(ActivityModel.wrap(metric));
                expect(items.at(2)).to.equal(ActivityModel.wrap(workout1));
            });
        });

    });

});
