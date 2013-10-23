// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
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
            expect(calendarManager.weeks).toBeDefined();
            expect(calendarManager.weeks.length).toEqual(0);
            expect(calendarManager.days).toBeDefined();
            expect(calendarManager.days.length).toEqual(0);
            expect(calendarManager.activities).toBeDefined();
            expect(calendarManager.activities.length).toEqual(0);
        });

        it(".ensure(today) should add 1 week and 7 days", function()
        {

            calendarManager.ensure(moment());

            expect(calendarManager.weeks.length).toEqual(1);
            expect(calendarManager.days.length).toEqual(7);

        });

        it(".ensure(today) then .ensure(next week) should add 2 weeks and 14 days", function()
        {

            calendarManager.ensure(moment());
            calendarManager.ensure(moment().add(1, "week"));

            expect(calendarManager.weeks.length).toEqual(2);
            expect(calendarManager.days.length).toEqual(14);

        });

        it(".ensure(today) then .ensure(last week) should add 2 weeks and 14 days", function()
        {

            calendarManager.ensure(moment());
            calendarManager.ensure(moment().subtract(1, "week"));

            expect(calendarManager.weeks.length).toEqual(2);
            expect(calendarManager.days.length).toEqual(14);

        });

        it(".ensure(last week) then .ensure(next week) should add 3 weeks and 21 days", function()
        {

            calendarManager.ensure(moment().subtract(1, "week"));
            calendarManager.ensure(moment().add(1, "week"));

            expect(calendarManager.weeks.length).toEqual(3);
            expect(calendarManager.days.length).toEqual(21);

        });

        it(".ensureRange(last week, next week) should add 3 week and 21 days", function()
        {
            calendarManager.ensureRange(moment().subtract(1, "week"), moment().add(1, "week"));

            expect(calendarManager.weeks.length).toEqual(3);
            expect(calendarManager.days.length).toEqual(21);
        });

        it(".ensureRange(next week, last week) (i.e. backwards) should still add 3 week and 21 days", function()
        {
            calendarManager.ensureRange(moment().add(1, "week"), moment().subtract(1, "week"));

            expect(calendarManager.weeks.length).toEqual(3);
            expect(calendarManager.days.length).toEqual(21);
        });

        describe(".aroundChanges", function()
        {

            it("should always trigger before/after:changes even if an exception is thrown", function()
            {
                var beforeEvent = jasmine.createSpy();
                var afterEvent = jasmine.createSpy();

                calendarManager.weeks.on("before:changes", beforeEvent);
                calendarManager.days.on("before:changes", beforeEvent);

                calendarManager.weeks.on("after:changes", afterEvent);
                calendarManager.days.on("after:changes", afterEvent);

                try { calendarManager.aroundChanges(function() { throw "Error"; }); } catch(e) {}

                expect(beforeEvent.callCount).toEqual(2);
                expect(afterEvent.callCount).toEqual(2);
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
                    expect(weeks.length).toEqual(4);
                });

                it("should add count weeks to the collection", function()
                {
                    calendarManager.ensure(moment());
                    calendarManager.weeks.preparePrevious(4);

                    expect(calendarManager.weeks.length).toEqual(5);
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
                    expect(weeks.length).toEqual(4);
                });

                it("should add count weeks to the collection", function()
                {
                    calendarManager.ensure(moment());
                    calendarManager.weeks.prepareNext(4);

                    expect(calendarManager.weeks.length).toEqual(5);
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
                    expect(days.length).toEqual(4);
                });

                it("should add count days to the collection", function()
                {
                    calendarManager.ensure(moment());
                    calendarManager.days.preparePrevious(4);

                    expect(calendarManager.days.length).toBeGreaterThan(5);
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
                    expect(days.length).toEqual(4);
                });

                it("should add count days to the collection", function()
                {
                    calendarManager.ensure(moment());
                    calendarManager.days.prepareNext(4);

                    expect(calendarManager.days.length).toBeGreaterThan(5);
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

                expect(calendarManager.days.get("2013-05-25").itemsCollection.length).toEqual(1);
                expect(calendarManager.days.get("2013-03-14").itemsCollection.length).toEqual(1);
            });

            it("should add activities to the correct day collection when their date is changed", function()
            {
                var workout = new WorkoutModel({ workoutDay: "2013-05-25" });
                var metric = new MetricModel({ timeStamp: "2013-03-14T15:00:00" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);

                workout.set("workoutDay", "2013-05-27");
                metric.set("timeStamp", "2013-02-02T10:01:11");

                expect(calendarManager.days.get("2013-05-27").itemsCollection.length).toEqual(1);
                expect(calendarManager.days.get("2013-02-02").itemsCollection.length).toEqual(1);
            });

            it("should remove activities from the old day collection when their date is changed", function()
            {
                var workout = new WorkoutModel({ workoutDay: "2013-05-25" });
                var metric = new MetricModel({ timeStamp: "2013-03-14T15:00:00" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);

                workout.set("workoutDay", "2013-05-27");
                metric.set("timeStamp", "2013-02-02");

                expect(calendarManager.days.get("2013-05-25").itemsCollection.length).toEqual(0);
                expect(calendarManager.days.get("2013-03-14").itemsCollection.length).toEqual(0);
            });

            it("should remove activites when the activites are destroyed", function()
            {
                var workout = new WorkoutModel({ workoutDay: "2013-05-25" });
                var metric = new MetricModel({ timeStamp: "2013-03-14T15:00:00" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);

                workout.destroy();
                metric.destroy();

                expect(calendarManager.days.get("2013-05-25").itemsCollection.length).toEqual(0);
                expect(calendarManager.days.get("2013-03-14").itemsCollection.length).toEqual(0);
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

                expect(calendarManager.activities.length).toEqual(2);

            });

        });

        describe(".reset", function()
        {

            it("should reset the dataManager", function()
            {
                spyOn(dataManager, "forceReset");

                calendarManager.reset();

                expect(dataManager.forceReset).toHaveBeenCalled();
            });

            it("should remove all activities", function()
            {
                var workout = new WorkoutModel({ workoutDay: "2013-05-25" });
                var metric = new MetricModel({ timeStamp: "2013-03-14T15:00:00" });

                calendarManager.addItem(workout);
                calendarManager.addItem(metric);

                calendarManager.reset();

                expect(calendarManager.activities.length).toEqual(0);
            });

            it("should set all weeks to the unfetched state", function()
            {

                calendarManager.ensure(moment().subtract(1, "week"), moment().add(1, "week"));

                calendarManager.weeks.first().getState().set({ isFetched: true });

                calendarManager.reset();

                expect(calendarManager.weeks.first().getState().get("isFetched")).toEqual(false);

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

                expect(calendarManager.get(WorkoutModel, 1)).toEqual(workout);
                expect(calendarManager.get(MetricModel, 1)).toEqual(metric);
            });

        });

    });

});

