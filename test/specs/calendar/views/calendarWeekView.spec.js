// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "TP",
    "views/calendarWeekView",
    "views/weekSummaryView",
    "views/calendarDayView"
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
            var weekSummaryItem = new TP.Model({});
            weekSummaryItem.isSummary = true;

            var dayItem = new TP.Model();
            
            var WeekItemView = CalendarWeekView.prototype.getItemView.call(null, weekSummaryItem);
            var CalendarItemView = CalendarWeekView.prototype.getItemView.call(null, dayItem);

            expect(WeekItemView).toBeDefined();
            expect(new WeekItemView({ model: new TP.Model() }) instanceof WeekSummaryView).toBeTruthy();

            expect(CalendarItemView).toBeDefined();
            expect(new CalendarItemView({ model: new TP.Model() }) instanceof CalendarDayView).toBeTruthy();
        });
    });

});