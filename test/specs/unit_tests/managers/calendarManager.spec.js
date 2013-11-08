define(
[
    "moment",
    "shared/managers/calendarManager",
    "framework/dataManager",
    "models/workoutModel",
    "shared/models/metricModel"
],
function(
    moment,
    CalendarManager,
    DataManager,
    WorkoutModel,
    MetricModel
)
{
    describe("CalendarManager", function()
    {

        var calendarManager, dataManager;
        beforeEach(function()
        {
            dataManager = new DataManager();
            calendarManager = new CalendarManager({ dataManager: dataManager });
        });


        it("should start with empty weeks, days, and activities collections", function()
        {
            expect(calendarManager.weeks).to.not.be.undefined;
            expect(calendarManager.weeks.length).to.eql(0);
            expect(calendarManager.days).to.not.be.undefined;
            expect(calendarManager.days.length).to.eql(0);
            expect(calendarManager.activities).to.not.be.undefined;
            expect(calendarManager.activities.length).to.eql(0);
        });

        it(".ensure(today) should add 1 week and 7 days", function()
        {

            calendarManager.ensure(moment());

            expect(calendarManager.weeks.length).to.eql(1);
            expect(calendarManager.days.length).to.eql(7);

        });

        it(".ensure(today) then .ensure(next week) should add 2 weeks and 14 days", function()
        {

            calendarManager.ensure(moment());
            calendarManager.ensure(moment().add(1, "week"));

            expect(calendarManager.weeks.length).to.eql(2);
            expect(calendarManager.days.length).to.eql(14);

        });

        it(".ensure(today) then .ensure(last week) should add 2 weeks and 14 days", function()
        {

            calendarManager.ensure(moment());
            calendarManager.ensure(moment().subtract(1, "week"));

            expect(calendarManager.weeks.length).to.eql(2);
            expect(calendarManager.days.length).to.eql(14);

        });

        it(".ensure(last week) then .ensure(next week) should add 3 weeks and 21 days", function()
        {

            calendarManager.ensure(moment().subtract(1, "week"));
            calendarManager.ensure(moment().add(1, "week"));

            expect(calendarManager.weeks.length).to.eql(3);
            expect(calendarManager.days.length).to.eql(21);

        });

        it(".ensureRange(last week, next week) should add 3 week and 21 days", function()
        {
            calendarManager.ensureRange(moment().subtract(1, "week"), moment().add(1, "week"));

            expect(calendarManager.weeks.length).to.eql(3);
            expect(calendarManager.days.length).to.eql(21);
        });

        it(".ensureRange(next week, last week) (i.e. backwards) should still add 3 week and 21 days", function()
        {
            calendarManager.ensureRange(moment().add(1, "week"), moment().subtract(1, "week"));

            expect(calendarManager.weeks.length).to.eql(3);
            expect(calendarManager.days.length).to.eql(21);
        });

        describe(".aroundChanges", function()
        {

            it("should always trigger before/after:changes even if an exception is thrown", function()
            {
                var beforeEvent = sinon.stub();
                var afterEvent = sinon.stub();

                calendarManager.weeks.on("before:changes", beforeEvent);
                calendarManager.days.on("before:changes", beforeEvent);

                calendarManager.weeks.on("after:changes", afterEvent);
                calendarManager.days.on("after:changes", afterEvent);

                try { calendarManager.aroundChanges(function() { throw "Error"; }); } catch(e) {}

                expect(beforeEvent.callCount).to.eql(2);
                expect(afterEvent.callCount).to.eql(2);
            });

        });

        describe("weeks collection", function()
        {

            describe(".preparePrevious", function()
            {

                it("should not fail, even if empty", function()
                {
                    calendarManager.weeks.preparePrevious(1);
                });

                it("should return the added weeks", function()
                {
                    var weeks = calendarManager.weeks.preparePrevious(4);
                    expect(weeks.length).to.eql(4);
                });

                it("should add count weeks to the collection", function()
                {
                    calendarManager.ensure(moment());
                    calendarManager.weeks.preparePrevious(4);

                    expect(calendarManager.weeks.length).to.eql(5);
                });

            });

            describe(".prepareNext", function()
            {

                it("should not fail, even if empty", function()
                {
                    calendarManager.weeks.prepareNext(1);
                });

                it("should return the added weeks", function()
                {
                    var weeks = calendarManager.weeks.prepareNext(4);
                    expect(weeks.length).to.eql(4);
                });

                it("should add count weeks to the collection", function()
                {
                    calendarManager.ensure(moment());
                    calendarManager.weeks.prepareNext(4);

                    expect(calendarManager.weeks.length).to.eql(5);
                });

            });

        });

        describe("days collection", function()
        {

            describe(".preparePrevious", function()
            {

                it("should not fail, even if empty", function()
                {
                    calendarManager.days.preparePrevious(1);
                });

                it("should return the added days", function()
                {
                    var days = calendarManager.days.preparePrevious(4);
                    expect(days.length).to.eql(4);
                });

                it("should add count days to the collection", function()
                {
                    calendarManager.ensure(moment());
                    calendarManager.days.preparePrevious(4);

                    expect(calendarManager.days.length).to.be.gt(5);
                });

            });

            describe(".prepareNext", function()
            {

                it("should not fail, even if empty", function()
                {
                    calendarManager.days.prepareNext(1);
                });

                it("should return the added days", function()
                {
                    var days = calendarManager.days.prepareNext(4);
                    expect(days.length).to.eql(4);
                });

                it("should add count days to the collection", function()
                {
                    calendarManager.ensure(moment());
                    calendarManager.days.prepareNext(4);

                    expect(calendarManager.days.length).to.be.gt(5);
                });

            });

        });

        describe("auto indexing", function()
        {

            it("should add activities to the correct day collection", function()
            {
                var workout = new WorkoutModel({ workoutDay: "2013-05-25" });
                var metric = new MetricModel({ timeStamp: "2013-03-14T15:00:00" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);

                expect(calendarManager.days.get("2013-05-25").itemsCollection.length).to.eql(1);
                expect(calendarManager.days.get("2013-03-14").itemsCollection.length).to.eql(1);
            });

            it("should add activities to the correct day collection when their date is changed", function()
            {
                var workout = new WorkoutModel({ workoutDay: "2013-05-25" });
                var metric = new MetricModel({ timeStamp: "2013-03-14T15:00:00" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);

                workout.set("workoutDay", "2013-05-27");
                metric.set("timeStamp", "2013-02-02T10:01:11");

                expect(calendarManager.days.get("2013-05-27").itemsCollection.length).to.eql(1);
                expect(calendarManager.days.get("2013-02-02").itemsCollection.length).to.eql(1);
            });

            it("should remove activities from the old day collection when their date is changed", function()
            {
                var workout = new WorkoutModel({ workoutDay: "2013-05-25" });
                var metric = new MetricModel({ timeStamp: "2013-03-14T15:00:00" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);

                workout.set("workoutDay", "2013-05-27");
                metric.set("timeStamp", "2013-02-02");

                expect(calendarManager.days.get("2013-05-25").itemsCollection.length).to.eql(0);
                expect(calendarManager.days.get("2013-03-14").itemsCollection.length).to.eql(0);
            });

            it("should remove activites when the activites are destroyed", function()
            {
                var workout = new WorkoutModel({ workoutDay: "2013-05-25" });
                var metric = new MetricModel({ timeStamp: "2013-03-14T15:00:00" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);

                workout.destroy();
                metric.destroy();

                expect(calendarManager.days.get("2013-05-25").itemsCollection.length).to.eql(0);
                expect(calendarManager.days.get("2013-03-14").itemsCollection.length).to.eql(0);
            });

        });

        describe(".addItem", function()
        {

            it("should add the items to the activites collection", function()
            {

                var workout = new WorkoutModel({ workoutDay: "2013-05-25" });
                var metric = new MetricModel({ timeStamp: "2013-03-14T15:00:00" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);

                expect(calendarManager.activities.length).to.eql(2);

            });

        });

        describe(".addOrUpdateItem", function()
        {

            it("should add the items to the activites collection", function()
            {
                calendarManager.addOrUpdateItem(WorkoutModel, { workoutDay: "2013-05-25" });
                calendarManager.addOrUpdateItem(MetricModel, { timeStamp: "2013-03-14T15:00:00" });

                expect(calendarManager.activities.length).to.eql(2);

            });

            it("should update existing items in the activites collection", function()
            {

                var workout = calendarManager.addOrUpdateItem(WorkoutModel, { workoutId: 12345, workoutDay: "2013-05-25" });

                var updatedWorkoutData = { workoutId: 12345, description: "Now i have a description" };
                var updatedWorkout = calendarManager.addOrUpdateItem(WorkoutModel, updatedWorkoutData);

                expect(calendarManager.activities.length).to.eql(1);
                expect(updatedWorkout).to.equal(workout);
                expect(workout.get("workoutDay")).to.eql("2013-05-25");
                expect(workout.get("description")).to.eql("Now i have a description");

            });

        });

        describe(".reset", function()
        {

            it("should reset the dataManager", function()
            {
                sinon.stub(dataManager, "forceReset");

                calendarManager.reset();

                expect(dataManager.forceReset).to.have.been.called;
            });

            it("should remove all activities", function()
            {
                var workout = new WorkoutModel({ workoutDay: "2013-05-25" });
                var metric = new MetricModel({ timeStamp: "2013-03-14T15:00:00" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);

                calendarManager.reset();

                expect(calendarManager.activities.length).to.eql(0);
            });

            it("should set all weeks to the unfetched state", function()
            {

                calendarManager.ensure(moment().subtract(1, "week"), moment().add(1, "week"));

                calendarManager.weeks.first().getState().set({ isFetched: true });

                calendarManager.reset();

                expect(calendarManager.weeks.first().getState().get("isFetched")).to.eql(false);

            });

        });

        describe(".get", function()
        {

            it("should fetch the correct model based on id and type", function()
            {
                var workout = new WorkoutModel({ workoutId: 1, workoutDay: "2013-05-25" });
                var metric = new MetricModel({ id: 1, timeStamp: "2013-03-14T15:00:00" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);

                expect(calendarManager.get(WorkoutModel, 1)).to.eql(workout);
                expect(calendarManager.get(MetricModel, 1)).to.eql(metric);
            });

        });

    });

});

