// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "testUtils/testHelpers",
    "TP",
    "views/calendar/calendarWeekView",
    "views/weekSummary/weekSummaryView",
    "views/calendar/day/calendarDayView"
],
function(testHelpers, TP, CalendarWeekView, WeekSummaryView, CalendarDayView)
{

    describe("CalendarWeekView", function()
    {
        beforeEach(function()
        {
            testHelpers.startTheApp();
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("should be loaded as a module", function()
        {
            expect(CalendarWeekView).toBeDefined();
        });

        it("should render days and summary", function()
        {
            var weekModel = new TP.Model();
            var daysCollection = new TP.Collection();
            var dayModel = new TP.Model();
            dayModel.itemsCollection = new TP.Collection();

            weekModel.set({ week: daysCollection, days: daysCollection });
            daysCollection.add(dayModel);

            var weekView = new CalendarWeekView({ model: weekModel });
            weekView.render();

            expect(weekView.children.length).toEqual(2);
            expect(weekView.children.findByIndex(0) instanceof CalendarDayView).toBe(true);
            expect(weekView.children.findByIndex(1) instanceof WeekSummaryView).toBe(true);
        });
    });

});

