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

    describe("open the quick view", function()
    {

        describe("For a new workout", function()
        {
            var $mainRegion;
            var $body;

            
            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = theApp.mainRegion.$el;
                $body = theApp.getBodyElement();
                theApp.router.navigate("calendar", true);
            });

            it("Should display the calendar", function()
            {
                expect($body.find("#calendarContainer").length).toBe(1);
            });

            it("Should display today in the calendar", function()
            {
                expect($mainRegion.find("#calendarContainer .day.today").length).toBe(1);
            });

            it("Should display the new item view when clicking on today", function()
            {
                // not visible yet
                expect($body.find(".newItemView").length).toBe(0);

                // click add workout
                $mainRegion.find("#calendarContainer .day.today .addWorkout").trigger("click");

                // should be visible now
                expect($body.find(".newItemView").length).toBe(1);
            });

            it("Should display a 'Run' button in the new item view", function()
            {
                // no run button yet
                expect($body.find(".newItemView button[data-workoutid=3]").length).toBe(0);

                // click add workout
                $mainRegion.find("#calendarContainer .day.today .addWorkout").trigger("click");

                // now button shows up in new item view
                expect($body.find(".newItemView button[data-workoutid=3]").length).toBe(1);
            });

            it("Should display the quick view after clicking a workout type in the new item view", function()
            {
                // no qv yet
                expect($body.find(".workoutQuickView").length).toBe(0);

                // open new item view
                $mainRegion.find("#calendarContainer .day.today .addWorkout").trigger("click");

                // add run
                $body.find("button[data-workoutid=3]").trigger("click"); // 3=run

                // should have a qv
                expect($body.find(".workoutQuickView").length).toBe(1);
            });
        });

    });


});