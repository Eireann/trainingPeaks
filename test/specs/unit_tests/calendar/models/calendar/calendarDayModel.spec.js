define(
[
    "testUtils/testHelpers",
    "models/workoutModel",
    "shared/models/activityModel",
    "models/calendar/calendarDay"
],
function(
    testHelpers,
    WorkoutModel,
    ActivityModel,
    CalendarDay
)
{
    describe("Calendar Day Model", function()
    {

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
                expect(ActivityModel.unwrap(workouts.get("Workout:" + workout.id))).to.equal(workout);
            });

        });

        describe("Cut, Copy, Paste", function()
        {

            var calendarDay;
            var workouts;

            beforeEach(function()
            {
                workouts = [];
                calendarDay = new CalendarDay({ date: "2011-03-02" });
                for (var i = 0; i < 10; i++)
                {
                    var workout = new WorkoutModel({ workoutDay: "2011-03-02T00:00:00", workoutId: "12345" + Number(i).toString() });
                    workouts.push(workout);
                    calendarDay.add(workout);
                    sinon.spy(workout, "cloneForCopy");
                    sinon.spy(workout, "pasted");
                }
            });

            describe("cloneForCopy", function()
            {

                it("Should return a new CalendarDay model", function()
                {
                    var copiedDay = calendarDay.cloneForCopy();
                    expect(copiedDay instanceof CalendarDay).to.equal(true);
                });

                it("Should not return itself", function()
                {
                    var copiedDay = calendarDay.cloneForCopy();
                    expect(copiedDay).to.not.equal(calendarDay);
                });

                it("Should have the correct number of items", function()
                {
                    var copiedDay = calendarDay.cloneForCopy();
                    expect(copiedDay.length()).to.eql(workouts.length);
                });

                it("Should call copy on each of the workouts", function()
                {
                    var copiedDay = calendarDay.cloneForCopy();
                    _.each(workouts, function(workout)
                    {
                        expect(workout.cloneForCopy).to.have.been.called;
                    });
                });

            });

            describe("pasted", function()
            {

                it("Should call pasted on each of the copied workouts", function()
                {
                    var dateToPasteTo = "2030-12-25";
                    var copiedItems = calendarDay.cloneForCopy();
                    copiedItems.each(function(item)
                    {
                        sinon.stub(item, "pasted");
                    });
                    var pastedItems = copiedItems.pasted({ date: dateToPasteTo });
                    copiedItems.each(function(item)
                    {
                        expect(item.pasted).to.have.been.calledWith({ date: dateToPasteTo });
                    });
                });

            });

        });


    });

});
