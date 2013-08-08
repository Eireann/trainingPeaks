// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "TP",
    "moment",
    "app",
    "models/calendar/CalendarCollection",
    "views/calendar/container/calendarContainerView"
],
function($, TP, moment, theMarsApp, CalendarCollection, CalendarView)
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
                var collection_options = {
                    startDate: moment(),
                    endDate: moment().add("weeks", 2)
                };
                var collection =  new CalendarCollection(null, collection_options);

                spyOn(collection, "getWeekModelForDay").andReturn(new TP.Model());
                var calendarView = new CalendarView({ collection: collection });
                var weekView, dayView = {};
                var options = {};
                spyOn(calendarView, "trigger");
                calendarView.onItemDropped(weekView, dayView, options);
                expect(calendarView.trigger).toHaveBeenCalledWith("itemDropped", options);
            });
        });
    });
});