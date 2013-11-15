define(
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

    xdescribe("CalendarContainerView Scrolling (TODO: we should probably have a working test for scrolling to date)", function()
    {

        it("Should scroll to a given date", function ()
        {
            var collection_options = {
                    startDate: moment(),
                    endDate: moment().add("weeks", 2),
                    dataManager: new DataManager()
                },
                collection = null; // new CalendarCollection(null, collection_options); // This can't work as it's not imported

            sinon.stub(collection, "getWeekModelForDay").returns(new TP.Model());
            
            expect(CalendarContainerView.prototype.scrollToDate).to.not.be.undefined;
            expect(typeof CalendarContainerView.prototype.scrollToDate).to.equal("function");

            var calendarContainerView = new CalendarContainerView({ calendarHeaderModel: new TP.Model(), collection: collection});
            sinon.stub(calendarContainerView.weeksCollectionView, "scrollToModel");
            calendarContainerView.scrollToDate(moment("2013-01-01"));
            expect(calendarContainerView.weeksCollectionView.scrollToModel).to.have.been.called;
        });

    });
});
