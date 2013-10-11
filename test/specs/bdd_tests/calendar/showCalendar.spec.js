// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app",
    "moment"
],
function(
    testHelpers,
    xhrData,
    theApp,
    moment)
{

    describe("open the calendar", function()
    {
        var $mainRegion;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            $mainRegion = theApp.mainRegion.$el;
            theApp.router.navigate("calendar", true);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should display the calendar", function()
        {
            expect($mainRegion.find("#calendarContainer").length).toBe(1);
        });

        xit("Should display today in the calendar", function()
        {
            expect($mainRegion.find("#calendarContainer .day.today").length).toBe(1);
        });

        xit("Should be able to navigate away and back to the calendar", function()
        {
            expect($mainRegion.find("#calendarContainer").length).toBe(1);
            theApp.router.navigate("dashboard", { trigger: true });
            expect($mainRegion.find("#calendarContainer").length).toBe(0);
            theApp.router.navigate("calendar", { trigger: true });
            expect($mainRegion.find("#calendarContainer").length).toBe(1);
        });

        xdescribe("Should remember what date I was viewing when navigating in and out of the calendar", function()
        {
            var controller, calendarContainerView;
            beforeEach(function()
            {
                theApp.router.navigate("calendar", {trigger: true});
                controller = theApp.controllers.calendarController;
                calendarContainerView = controller.views.calendar;

                controller.showDate(moment("01/28/2013"));
                calendarContainerView._loadDataAfterScroll(); // Trigger our after scroll callback manually since Jasmine can't scroll and wait for the callback
            });

            it("Should store the date in the header model", function()
            {
                expect(controller.views.calendar.calendarHeaderModel.get('currentDay')).toBe("2013-01-28");
            });

            it("Should go back to that date when navigating to dashboard and back to calendar", function()
            {
                theApp.router.navigate("dashboard", {trigger: true});
                theApp.router.navigate("calendar", {trigger: true});
                expect(controller.views.calendar.weeksCollectionView.firstModel.get('id')).toBe("2013-01-28");
            });

            xit("Should go back to that date when navigating to home and back to calendar", function()
            {
                theApp.router.navigate("home", {trigger: true});
                theApp.router.navigate("calendar", {trigger: true});
                expect(controller.views.calendar.weeksCollectionView.firstModel.get('id')).toBe("2013-01-28");
            });

            xit("Should go back to that date when navigating to home then dashboard then back to calendar", function()
            {
                theApp.router.navigate("home", {trigger: true});
                theApp.router.navigate("dashboard", {trigger: true});
                theApp.router.navigate("calendar", {trigger: true});
                expect(controller.views.calendar.weeksCollectionView.firstModel.get('id')).toBe("2013-01-28");
            });

        });

    });


});
