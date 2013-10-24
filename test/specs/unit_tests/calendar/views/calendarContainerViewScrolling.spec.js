// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "TP",
    "moment",
    "framework/dataManager",
    "views/calendar/container/calendarContainerView",
    "views/scrollableCollectionView"
],
function($, TP, moment, DataManager, CalendarContainerView, ScrollableCollectionView)
{

    xdescribe("CalendarContainerView Scrolling", function()
    {

        it("Should scroll to a given date", function ()
        {
            var collection_options = {
                    startDate: moment(),
                    endDate: moment().add("weeks", 2),
                    dataManager: new DataManager()
                },
                collection =  new CalendarCollection(null, collection_options);

            spyOn(collection, "getWeekModelForDay").andReturn(new TP.Model());
            
            expect(CalendarContainerView.prototype.scrollToDate).toBeDefined();
            expect(typeof CalendarContainerView.prototype.scrollToDate).toBe("function");

            var calendarContainerView = new CalendarContainerView({ calendarHeaderModel: new TP.Model(), collection: collection});
            spyOn(calendarContainerView.weeksCollectionView, "scrollToModel");
            calendarContainerView.scrollToDate(moment("2013-01-01"));
            expect(calendarContainerView.weeksCollectionView.scrollToModel).toHaveBeenCalled();
        });

    });
});
