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

            var context = new TP.Collection();
            context.startOfWeekDayIndex = 0;
            context.summaryViewEnabled = false;
            
            var weekCollection = CalendarCollection.prototype.createWeekCollectionStartingOn.apply(context, weekStartDate);
            var weekWrapperModel = new TP.Model({ id: weekStartDate.format("YYYY-MM-DD"), week: weekCollection });

            context.add(weekWrapperModel);
            
            var dayInsideOfWeek = moment().day(3);

            expect(function() { CalendarCollection.prototype.getDayModel.apply(context, dayInsideOfWeek); }).not.toThrow();
            expect(CalendarCollection.prototype.getDayModel.apply(context, dayInsideOfWeek, 0)).toBeDefined();
            expect(CalendarCollection.prototype.getDayModel.apply(context, dayInsideOfWeek, 0).get("date").unix()).toBe(dayInsideOfWeek.unix());
        });
        
        xit("should have a method to retrieve a specific day inside a Week by the day's date, when the week starts on a Monday", function()
        {
            var today = moment();
            var weekStartDate = moment(today).day(1);

            var context = { summaryViewEnabled: false };
            var weekCollection = CalendarController.prototype.createWeekCollectionStartingOn.call(context, weekStartDate);
            
            var dayInsideOfWeek = moment(today).day(2);
            var weekWrapperModel = new TP.Model({ id: weekStartDate.format("YYYY-MM-DD"), week: weekCollection });

            var calendarCollection = new CalendarCollection();
            calendarCollection.add(weekWrapperModel);

            expect(function() { calendarCollection.getDayModel(dayInsideOfWeek, 1); }).not.toThrow();
            expect(calendarCollection.getDayModel(dayInsideOfWeek, 0)).toBeDefined();
            expect(calendarCollection.getDayModel(dayInsideOfWeek, 0).get("date").unix()).toBe(dayInsideOfWeek.unix());
        });

        it("should have a method to add a workout to a day in the collection", function()
        {
            expect(typeof CalendarCollection.prototype.addWorkoutToCalendarDay).toBe("function");
        });

        xdescribe("addWorkoutToCalendarDay", function()
        {
            it("should add a workout (with a workoutDate inside the collection's date range) to the correct day", function()
            {


            });
        });
    });

});