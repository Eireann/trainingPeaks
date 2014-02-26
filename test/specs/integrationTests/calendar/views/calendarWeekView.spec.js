define(
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

        it("should be loaded as a module", function()
        {
            expect(CalendarWeekView).to.not.be.undefined;
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

            expect(weekView.children.length).to.eql(2);
            expect(weekView.children.findByIndex(0) instanceof CalendarDayView).to.equal(true);
            expect(weekView.children.findByIndex(1) instanceof WeekSummaryView).to.equal(true);
        });
    });

});

