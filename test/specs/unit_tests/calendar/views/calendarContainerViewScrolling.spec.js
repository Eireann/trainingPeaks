// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "TP",
    "moment",
    "app",
    "views/calendar/container/calendarContainerView",
    "views/scrollableCollectionView"
],
function($, TP, moment, theMarsApp, CalendarContainerView, ScrollableCollectionView)
{

    describe("CalendarContainerView Scrolling", function()
    {

        var calendarView;

        beforeEach(function()
        {
            calendarView = new CalendarContainerView({ collection: new TP.Collection() });
        });

        it("Should scroll to a given date", function ()
        {
            expect(CalendarContainerView.prototype.scrollToDate).toBeDefined();
            expect(typeof CalendarContainerView.prototype.scrollToDate).toBe("function");

            var calendarContainerView = new CalendarContainerView({ calendarHeaderModel: new TP.Model(), collection: new TP.Collection() });
            spyOn(calendarContainerView.weeksCollectionView, "scrollToModel");
            calendarContainerView.scrollToDate(moment("2013-01-01"));
            expect(calendarContainerView.weeksCollectionView.scrollToModel).toHaveBeenCalled();
        });

    });
});