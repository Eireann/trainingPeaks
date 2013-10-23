// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "TP",
    "moment",
    "app",
    "framework/dataManager",
    "controllers/calendar/CalendarController",
    "views/calendar/calendarHeaderView",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs"
],
function($, TP, moment, theMarsApp, DataManager, CalendarController, CalendarHeaderView, testHelpers, xhrData)
{

    describe("CalendarHeaderView ", function()
    {

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should be loaded as a module", function()
        {
            expect(CalendarHeaderView).toBeDefined();
        });

        it("Should update the calendar when a specific date is requested through the datepicker", function()
        {

            var controller = new CalendarController({ dataManager: new DataManager() });
            controller.initializeHeader();
            controller.showHeader();
            spyOn(controller, "showDate");
            controller.views.header.$el.find('input.datepicker').val("8/28/2013");
            controller.views.header.$el.find('input.datepicker').trigger("change");
            expect(controller.showDate).toHaveBeenCalledWith("2013-08-28");
        });
    });
});
