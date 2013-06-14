// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app"
],
function(
    testHelpers,
    xhrData,
    theApp)
{

    describe("open the calendar", function()
    {
        var $mainRegion;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            $mainRegion = theApp.mainRegion.$el;
        });

        it("Should display the calendar", function()
        {
            expect($mainRegion.find("#calendarContainer").length).toBe(1);
        });

        it("Should display today in the calendar", function()
        {
            expect($mainRegion.find("#calendarContainer .day.today").length).toBe(1);
        });

        it("Should be able to navigate away and back to the calendar", function()
        {
            expect($mainRegion.find("#calendarContainer").length).toBe(1);
            theApp.router.navigate("home", { trigger: true });
            expect($mainRegion.find("#calendarContainer").length).toBe(0);
            theApp.router.navigate("calendar", { trigger: true });
            expect($mainRegion.find("#calendarContainer").length).toBe(1);
        });

    });


});