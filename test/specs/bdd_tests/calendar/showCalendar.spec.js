define(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "moment"
],
function(
    testHelpers,
    xhrData,
    moment
)
{

    describe("open the calendar", function()
    {
        var $mainRegion;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            $mainRegion = testHelpers.theApp.mainRegion.$el;
            testHelpers.theApp.router.navigate("calendar", true);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should not display a list of athletes in the calendar", function()
        {
            expect($mainRegion.find(".athleteCalendarSelect").length).to.equal(0);
        });

        it("Should display today in the calendar", function()
        {
            expect($mainRegion.find("#calendarContainer .day.today").length).to.equal(1);
        });

        it("Should be able to navigate away and back to the calendar", function()
        {
            expect($mainRegion.find("#calendarContainer").length).to.equal(1);
            testHelpers.theApp.router.navigate("dashboard", { trigger: true });
            expect($mainRegion.find("#calendarContainer").length).to.equal(0);
            testHelpers.theApp.router.navigate("calendar", { trigger: true });
            expect($mainRegion.find("#calendarContainer").length).to.equal(1);
        });

        xdescribe("Should remember what date I was viewing when navigating in and out of the calendar (TODO: fix these tests)", function()
        {
            var controller, calendarContainerView;
            beforeEach(function()
            {
                testHelpers.theApp.router.navigate("calendar", {trigger: true});
                controller = testHelpers.theApp.controllers.calendarController;
                calendarContainerView = controller.views.calendar;

                controller.showDate(moment("01/28/2013"));
                calendarContainerView._loadDataAfterScroll(); // Trigger our after scroll callback manually since Jasmine can't scroll and wait for the callback
            });

            it("Should store the date in the header model", function()
            {
                expect(controller.views.calendar.calendarHeaderModel.get('currentDay')).to.equal("2013-01-28");
            });

            it("Should go back to that date when navigating to dashboard and back to calendar", function()
            {
                testHelpers.theApp.router.navigate("dashboard", {trigger: true});
                testHelpers.theApp.router.navigate("calendar", {trigger: true});
                expect(controller.views.calendar.weeksCollectionView.firstModel.get('id')).to.equal("2013-01-28");
            });

            it("Should go back to that date when navigating to home and back to calendar", function()
            {
                testHelpers.theApp.router.navigate("home", {trigger: true});
                testHelpers.theApp.router.navigate("calendar", {trigger: true});
                expect(controller.views.calendar.weeksCollectionView.firstModel.get('id')).to.equal("2013-01-28");
            });

            it("Should go back to that date when navigating to home then dashboard then back to calendar", function()
            {
                testHelpers.theApp.router.navigate("home", {trigger: true});
                testHelpers.theApp.router.navigate("dashboard", {trigger: true});
                testHelpers.theApp.router.navigate("calendar", {trigger: true});
                expect(controller.views.calendar.weeksCollectionView.firstModel.get('id')).to.equal("2013-01-28");
            });

        });

    });


});
