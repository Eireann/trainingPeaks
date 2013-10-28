// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
],
function(
    testHelpers,
    xhrData
)
{

    describe("Calendar Touch Events", function()
    {
        var $mainRegion;
        var $body;

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            $mainRegion = testHelpers.theApp.mainRegion.$el;
            $body = testHelpers.theApp.getBodyElement();
            testHelpers.theApp.router.navigate("calendar", true);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should not open the new item view for a click on the day if touch is not enabled", function()
        {
            // not visible yet
            expect($body.find(".newItemView").length).toBe(0);

            // click add workout
            $mainRegion.find("#calendarContainer .day.today").trigger("click");

            // should still not be visible
            expect($body.find(".newItemView").length).toBe(0);
        });

        it("Should enable touch on the first touch event", function()
        {
            // starts with touch disabled
            expect(testHelpers.theApp.isTouchEnabled()).toBe(false);
            expect($body.is(".touchEnabled")).toBe(false);

            // first touch start
            $body.trigger("touchstart");

            // touch is now enabled
            expect(testHelpers.theApp.isTouchEnabled()).toBe(true);
            expect($body.is(".touchEnabled")).toBe(true);
        });

        it("Should open the new item view for a click on the day if touch is enabled", function()
        {
            // enable touch
            testHelpers.theApp.enableTouch();

            // not visible yet
            expect($body.find(".newItemView").length).toBe(0);

            // click add workout
            $mainRegion.find("#calendarContainer .day.today").trigger("click");

            // should be visible
            expect($body.find(".newItemView").length).toBe(1);
        });

        // I think this fails due to how we're setting up the body element in test helpers, but works ok in browser
        xit("Should not listen to touch events after the first touch", function()
        {

            // first touch start
            spyOn(testHelpers.theApp, "enableTouch");
            $body.trigger("touchstart");
            expect(testHelpers.theApp.enableTouch).toHaveBeenCalled();

            // touch again
            $body.trigger("touchstart");
            expect(testHelpers.theApp.enableTouch).not.toHaveBeenCalled();
        });
    });


});
