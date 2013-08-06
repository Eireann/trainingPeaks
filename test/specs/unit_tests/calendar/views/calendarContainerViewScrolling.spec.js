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

        var calendarView, appendSpy, prependSpy;

        beforeEach(function()
        {
            calendarView = new CalendarContainerView({ collection: new TP.Collection() });
            prependSpy = jasmine.createSpy("onPrepend");
            calendarView.on("scroll:top", prependSpy);
            appendSpy = jasmine.createSpy("onAppend");
            calendarView.on("scroll:bottom", appendSpy);
            calendarView.render();
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