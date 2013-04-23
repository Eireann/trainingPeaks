// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "TP",
    "moment",
    "app",
    "views/calendar/container/calendarContainerView"
],
function($, TP, moment, theMarsApp, CalendarContainerView)
{

    describe("CalendarContainerView Scrolling", function()
    {

        var calendarView, appendSpy, prependSpy;

        beforeEach(function()
        {
            calendarView = new CalendarContainerView({ collection: new TP.Collection() });
            prependSpy = jasmine.createSpy("onPrepend");
            calendarView.on("prepend", prependSpy);
            appendSpy = jasmine.createSpy("onAppend");
            calendarView.on("append", appendSpy);
            calendarView.render();

        });

        it("Should trigger prepend event on scroll up past threshhold", function()
        {
            spyOn(calendarView, "getScrollTop").andReturn(0);
            spyOn(calendarView, "getHiddenHeight").andReturn(1000);

            calendarView.onScroll();

            expect(prependSpy).toHaveBeenCalled();
            expect(appendSpy).not.toHaveBeenCalled();
        });

        it("Should trigger append event on scroll down past threshhold", function()
        {
            spyOn(calendarView, "getScrollTop").andReturn(1000);
            spyOn(calendarView, "getHiddenHeight").andReturn(0);

            calendarView.onScroll();

            expect(appendSpy).toHaveBeenCalled();
            expect(prependSpy).not.toHaveBeenCalled();
        });

        // not actually checking the calculations inside scrollToToday,
        // as I was having a hard time getting the fake dom to give proper offset/position calculations
        it("Should scroll to today on show", function()
        {
            var calendarView = new CalendarContainerView({ collection: new TP.Collection() });
            spyOn(calendarView, "scrollToSelector");
            calendarView.render();
            calendarView.onShow();
            expect(calendarView.scrollToSelector).toHaveBeenCalledWith(".today");
        });

        it("Should scroll to a given selector", function ()
        {
            expect(CalendarContainerView.prototype.scrollToSelector).toBeDefined();
            expect(typeof CalendarContainerView.prototype.scrollToSelector).toBe("function");
            
            //TODO: More testing here
        });

        it("Should scroll to a given date", function ()
        {
            expect(CalendarContainerView.prototype.scrollToDate).toBeDefined();
            expect(typeof CalendarContainerView.prototype.scrollToDate).toBe("function");

            var calendarContainerView = new CalendarContainerView({ calendarHeaderModel: new TP.Model(), collection: new TP.Collection() });

            spyOn(calendarContainerView, "scrollToSelector");

            calendarContainerView.scrollToDate(moment("2013-01-01"));
        });

    });
});