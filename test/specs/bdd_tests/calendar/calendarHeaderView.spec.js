define(
[
    "jquery",
    "TP",
    "moment",
    "framework/dataManager",
    "controllers/calendar/CalendarController",
    "views/calendar/calendarHeaderView",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs"
],
function($, TP, moment, DataManager, CalendarController, CalendarHeaderView, testHelpers, xhrData)
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
            expect(CalendarHeaderView).to.not.be.undefined;
        });

        it("Should update the calendar when a specific date is requested through the datepicker", function()
        {

            sinon.stub(CalendarController.prototype, "showDate");
            var controller = new CalendarController({ dataManager: new DataManager() });
            controller.initializeHeader();
            controller.showHeader();
            controller.views.header.$el.find('input.datepicker').val("8/28/2013");
            controller.views.header.$el.find('input.datepicker').trigger("change");
            expect(controller.showDate).to.have.been.calledWith("2013-08-28");
        });

        it("Should display the current month and year, based on the last day of the current week", function()
        {
            var stateModel = new TP.Model({ date: moment().format("YYYY-MM-DD") });
            var view = new CalendarHeaderView({ model: stateModel });
            view.render();

            stateModel.set("date", "2013-10-21");
            expect(view.$(".calendarMonthLabel").text()).to.contain("October");
            expect(view.$(".calendarMonthLabel").text()).to.contain("2013");

            stateModel.set("date", "2013-10-28");
            expect(view.$(".calendarMonthLabel").text()).to.contain("November");

            stateModel.set("date", "2013-11-25");
            expect(view.$(".calendarMonthLabel").text()).to.contain("December");

            stateModel.set("date", "2013-12-23");
            expect(view.$(".calendarMonthLabel").text()).to.contain("December");

            stateModel.set("date", "2013-12-30");
            expect(view.$(".calendarMonthLabel").text()).to.contain("January");
            expect(view.$(".calendarMonthLabel").text()).to.contain("2014");
        });

    });
});
