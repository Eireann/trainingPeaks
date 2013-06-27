// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "models/workoutModel",
    "models/calendar/calendarDay"
],
function(
    testHelpers,
    xhrData,
    WorkoutModel,
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
                expect(workouts.get(workout.id)).toBe(workout);
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
                calendarDay.configureDayLabel();
                for (var i = 0; i < 10; i++)
                {
                    var workout = new WorkoutModel({ workoutDay: "2011-03-02T00:00:00", workoutId: "12345" + Number(i).toString() });
                    workouts.push(workout);
                    calendarDay.add(workout);
                    spyOn(workout, "copyToClipboard").andCallThrough();
                    spyOn(workout, "cutToClipboard").andCallThrough();
                    spyOn(workout, "onPaste").andCallThrough();
                }
            });

            describe("copyToClipboard", function()
            {

                it("Should return a new CalendarDay model", function()
                {
                    var copiedDay = calendarDay.copyToClipboard();
                    expect(copiedDay instanceof CalendarDay).toBe(true);
                });

                it("Should not return itself", function()
                {
                    var copiedDay = calendarDay.copyToClipboard();
                    expect(copiedDay).not.toBe(calendarDay);
                });

                it("Should have the correct number of items", function()
                {
                    var copiedDay = calendarDay.copyToClipboard();
                    expect(copiedDay.length()).toEqual(workouts.length);
                });

                it("Should call copy on each of the workouts", function()
                {
                    var copiedDay = calendarDay.copyToClipboard();
                    _.each(workouts, function(workout)
                    {
                        expect(workout.copyToClipboard).toHaveBeenCalled();
                    });
                });

            });

            describe("cutToClipboard", function()
            {

                it("Should return a new CalendarDay model", function()
                {
                    var cutDay = calendarDay.cutToClipboard();
                    expect(cutDay instanceof CalendarDay).toBe(true);
                });

                it("Should not return itself", function()
                {
                    var cutDay = calendarDay.cutToClipboard();
                    expect(cutDay).not.toBe(calendarDay);
                });

                it("Should have the correct number of items", function()
                {
                    var cutDay = calendarDay.cutToClipboard();
                    expect(cutDay.length()).toEqual(workouts.length);
                });

                it("Should call cut on each of the workouts", function()
                {
                    var cutDay = calendarDay.cutToClipboard();
                    _.each(workouts, function(workout)
                    {
                        expect(workout.cutToClipboard).toHaveBeenCalled();
                    });
                });

            });

            describe("onPaste", function()
            {

                it("Should have the correct number of items", function()
                {
                    var pastedItems = calendarDay.copyToClipboard().onPaste("2020-01-01");
                    expect(pastedItems.length).toEqual(workouts.length);
                });

                it("Should call onPaste on each of the copied workouts", function()
                {
                    var dateToPasteTo = "2030-12-25";
                    var copiedItems = calendarDay.copyToClipboard();
                    copiedItems.itemsCollection.each(function(item)
                    {
                        spyOn(item, "onPaste").andCallThrough();
                    });
                    var pastedItems = copiedItems.onPaste(dateToPasteTo);
                    copiedItems.itemsCollection.each(function(item)
                    {
                        expect(item.onPaste).toHaveBeenCalledWith(dateToPasteTo);
                    });
                });

            });

        });


    });

});