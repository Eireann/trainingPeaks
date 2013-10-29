// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "moment",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs"
],
function(
    moment,
    testHelpers,
    xhrData
)
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
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                $body = testHelpers.theApp.getBodyElement();
                testHelpers.theApp.router.navigate("calendar", true);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
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
                expect($body.find(".newItemView [data-workoutid=3]").length).toBe(0);

                // click add workout
                $mainRegion.find("#calendarContainer .day.today .addWorkout").trigger("click");

                // now button shows up in new item view
                expect($body.find(".newItemView [data-workoutid=3]").length).toBe(1);
            });

            it("Should display the quick view after clicking a workout type in the new item view", function()
            {
                // no qv yet
                expect($body.find(".workoutQuickView").length).toBe(0);

                // open new item view
                $mainRegion.find("#calendarContainer .day.today .addWorkout").trigger("click");

                // add run
                $body.find("[data-workoutid=3]").trigger("click"); // 3=run

                // should have a qv
                expect($body.find(".workoutQuickView").length).toBe(1);
            });
        });


        describe("For an existing workout", function()
        {
            var $mainRegion;
            var $body;
            
            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                $body = testHelpers.theApp.getBodyElement();
                testHelpers.theApp.router.navigate("calendar", true);

                var workout = {
                    workoutId: 1,
                    workoutDay: moment().format("YYYY-MM-DD"),
                    title: "Today's workout",
                    workoutTypeValueId: 2,
                    athleteId: 426489
                };

                testHelpers.resolveRequest("GET", "workouts/" + moment().day(1).format("YYYY-MM-DD"), [workout]);
                testHelpers.resolveRequest("GET", "timedmetrics/" + moment().day(1).format("YYYY-MM-DD"), []);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should display the calendar", function()
            {
                expect($body.find("#calendarContainer").length).toBe(1);
            });

            it("Should display today in the calendar", function()
            {
                expect($mainRegion.find("#calendarContainer .day.today").length).toBe(1);
            });

            it("Should display a workout in today", function()
            {
                expect($mainRegion.find("#calendarContainer .day.today .workout").length).toBe(1);
            });

            it("Should display a quickview after clicking the workout", function()
            {
                $mainRegion.find("#calendarContainer .day.today .workout").trigger("mouseup");
                expect($body.find(".workoutQuickView").length).toBe(1);
            });

            it("Should request detail data", function()
            {

                // open the qv
                runs(function()
                {
                    $mainRegion.find("#calendarContainer .day.today .workout").trigger("mouseup");
                });

                // wait for detail data reqeust
                waitsFor(function()
                {
                    return testHelpers.hasRequest("GET", "detaildata");
                }, "Detail Data was never requested", 5000);

                runs(function()
                {
                    expect(testHelpers.hasRequest("GET", "detaildata")).toBe(true); 
                });
            });

        });

    });


});
