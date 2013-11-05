// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "TP",
    "moment",
    "framework/dataManager",
    "views/calendar/container/calendarContainerView"
],
function($, TP, moment, DataManager, CalendarView)
{

    xdescribe("CalendarView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(CalendarView).to.not.be.undefined;
        });

        describe("Workout drag and drop", function()
        {

            it("Should trigger itemDropped event", function()
            {
                var collection_options = {
                    startDate: moment(),
                    endDate: moment().add("weeks", 2),
                    dataManager: new DataManager()
                };
                var collection =  new CalendarCollection(null, collection_options);

                sinon.stub(collection, "getWeekModelForDay").returns(new TP.Model());
                var calendarView = new CalendarView({ collection: collection });
                var weekView, dayView = {};
                var options = {};
                sinon.stub(calendarView, "trigger");
                calendarView.onItemDropped(weekView, dayView, options);
                expect(calendarView.trigger).to.have.been.calledWith("itemDropped", options);
            });
        });
    });
});
