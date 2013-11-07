define(
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
            expect($body.find(".newItemView").length).to.equal(0);

            // click add workout
            $mainRegion.find("#calendarContainer .day.today").trigger("click");

            // should still not be visible
            expect($body.find(".newItemView").length).to.equal(0);
        });

        it("Should enable touch on the first touch event", function()
        {
            // starts with touch disabled
            expect(testHelpers.theApp.isTouchEnabled()).to.equal(false);
            expect($body.is(".touchEnabled")).to.equal(false);

            // first touch start
            $body.trigger("touchstart");

            // touch is now enabled
            expect(testHelpers.theApp.isTouchEnabled()).to.equal(true);
            expect($body.is(".touchEnabled")).to.equal(true);
        });

        it("Should open the new item view for a click on the day if touch is enabled", function()
        {
            // enable touch
            testHelpers.theApp.enableTouch();

            // not visible yet
            expect($body.find(".newItemView").length).to.equal(0);

            // click add workout
            $mainRegion.find("#calendarContainer .day.today").trigger("click");

            // should be visible
            expect($body.find(".newItemView").length).to.equal(1);
        });

        // I think this fails due to how we're setting up the body element in test helpers, but works ok in browser
        it("Should not listen to touch events after the first touch", function()
        {

            // first touch start
            var enableTouch = sinon.stub(testHelpers.theApp, "enableTouch");
            $body.trigger("touchstart");
            expect(testHelpers.theApp.enableTouch).to.have.been.called;

            // touch again
            enableTouch.reset();
            $body.trigger("touchstart");
            expect(testHelpers.theApp.enableTouch).to.not.have.been.called;
        });
    });


});
