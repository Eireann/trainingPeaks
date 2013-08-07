// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "TP",
    "moment",
    "app",
    "views/calendar/container/calendarContainerView"
],
function($, TP, moment, theMarsApp, CalendarView)
{

    describe("CalendarView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(CalendarView).toBeDefined();
        });

        describe("Workout drag and drop", function()
        {

            it("Should trigger itemDropped event", function()
            {
                var calendarView = new CalendarView({ collection: new TP.Collection() });
                var weekView, dayView = {};
                var options = {};
                spyOn(calendarView, "trigger");
                calendarView.onItemDropped(weekView, dayView, options);
                expect(calendarView.trigger).toHaveBeenCalledWith("itemDropped", options);
            });
        });
    });
});