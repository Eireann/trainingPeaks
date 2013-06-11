// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "TP",
    "views/calendar/calendarWeekView",
    "views/weekSummary/weekSummaryView",
    "views/calendar/day/calendarDayView"
],
function(TP, CalendarWeekView, WeekSummaryView, CalendarDayView)
{

    describe("CalendarWeekView", function()
    {
        it("should be loaded as a module", function()
        {
            expect(CalendarWeekView).toBeDefined();
        });

        it("should dynamically pick an itemView based on the item model", function()
        {
            var parentCollection = new TP.Collection({});
            var weekSummaryItem = new TP.Model({});
            var calendarDayModel = new TP.Model({});
            calendarDayModel.itemsCollection = new TP.Collection();

            weekSummaryItem.isSummary = true;

            var dayItem = new TP.Model();
            
            var WeekItemView = CalendarWeekView.prototype.getItemView.call(null, weekSummaryItem);
            var CalendarItemView = CalendarWeekView.prototype.getItemView.call(null, dayItem);
            var weekSummaryModel = new TP.Model({});
            parentCollection.add(weekSummaryModel);
            
            expect(WeekItemView).toBeDefined();
            expect(new WeekItemView({ model: weekSummaryModel }) instanceof WeekSummaryView).toBeTruthy();

            expect(CalendarItemView).toBeDefined();
            expect(new CalendarItemView({ model: calendarDayModel }) instanceof CalendarDayView).toBeTruthy();
        });
    });

});