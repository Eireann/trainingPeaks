// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "TP",
    "moment",
    "models/calendarCollection",
    "controllers/calendarController"
],
function(TP, moment, CalendarCollection, CalendarController)
{
    describe("CalendarCollection ", function()
    {
        it("should load as a module", function()
        {
            expect(CalendarCollection).toBeDefined();
        });

        it("should have a default dateFormat string", function()
        {
            expect(CalendarCollection.prototype.dateFormat).toBe("YYYY-MM-DD");
        });

        it("should have a method to retrieve a specific day inside a Week by the day's date, when the week starts on a Sunday", function()
        {
            var weekStartDate = moment().day(0);

            var collection = new CalendarCollection([], {
                startDate: weekStartDate,
                endDate: moment().day(6).add("weeks", 2)
            });

            var dayInsideOfWeek = moment().day(3);

            expect(function() { collection.getDayModel(dayInsideOfWeek); }).not.toThrow();
            expect(collection.getDayModel(dayInsideOfWeek)).toBeDefined();
            expect(collection.getDayModel(dayInsideOfWeek).get("date").unix()).toBe(dayInsideOfWeek.unix());
        });

        it("should have a method to retrieve a specific day inside a Week by the day's date, when the week starts on a Monday", function()
        {

            var weekStartDate = moment().day(1);

            var collection = new CalendarCollection([], {
                startDate: weekStartDate,
                endDate: moment().day(7).add("weeks", 2)
            });

            var dayInsideOfWeek = moment().day(3);

            expect(function() { collection.getDayModel(dayInsideOfWeek); }).not.toThrow();
            expect(collection.getDayModel(dayInsideOfWeek)).toBeDefined();
            expect(collection.getDayModel(dayInsideOfWeek).get("date").unix()).toBe(dayInsideOfWeek.unix());

        });

        it("should have a method to add a workout to a day in the collection", function()
        {
            expect(typeof CalendarCollection.prototype.addWorkoutToCalendarDay).toBe("function");
        });

        describe("addWorkoutToCalendarDay", function()
        {
            it("should add a workout (with a workoutDate inside the collection's date range) to the correct day", function()
            {
                var collection = new CalendarCollection([], {
                    startDate: moment().day(1),
                    endDate: moment().day(7).add("weeks", 2)
                });

                var workoutDate = moment().day(4).format("YYYY-MM-DD");
                var workoutId = 'workout1';
                var workout = {
                    getCalendarDay: function() { return workoutDate; },
                    id: workoutId
                };

                var dayModel = collection.getDayModel(workoutDate);
                spyOn(dayModel, "add").andCallThrough();
                collection.addWorkoutToCalendarDay(workout);
                expect(dayModel.add).toHaveBeenCalledWith(workout);
            });
        });
    });

});