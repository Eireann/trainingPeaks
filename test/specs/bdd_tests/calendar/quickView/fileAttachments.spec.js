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

    describe("Quick View file attachments", function()
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

            it("Should not allow adding attachments for a new workout", function()
            {
                $mainRegion.find("#calendarContainer .day.today .addWorkout").trigger("click");
                $body.find("button[data-workoutid=3]").trigger("click"); // 3=run

                // should have a qv
                expect($body.find(".workoutQuickView").length).toBe(1);

                // should not have a dialog yet
                expect($body.find(".deleteConfirmation").length).toBe(0);

                // click attachment icon
                $body.find(".addAttachment").trigger("click");

                // should have a dialog
                expect($body.find(".deleteConfirmation").length).toBe(1);

                // should not have an attachments menu
                expect($body.find(".workoutFileUploadMenu").length).toBe(0);
            });

            it("Should allow adding attachments for a new workout", function()
            {

                // should request workouts for this week
                var monday = moment().day(1).format("YYYY-MM-DD");
                var sunday = moment().day(7).format("YYYY-MM-DD");
                var thisWeekWorkouts = "workouts/" + monday + "/" + sunday;
                var thisWeekMetrics = "timedmetrics/" + monday + "/" + sunday;
                expect(testHelpers.hasRequest("GET", thisWeekWorkouts)).toBe(true);

                var workouts = [
                    {
                        athleteId: 426489,
                        workoutId: 1,
                        workoutDay: moment().format("YYYY-MM-DD"),
                        title: "My Workout"
                    }
                ];

                expect($mainRegion.find("#calendarContainer .day.today .workout").length).toBe(0);
                testHelpers.resolveRequest("GET", thisWeekWorkouts, workouts);
                testHelpers.resolveRequest("GET", thisWeekMetrics, []);
                expect($mainRegion.find("#calendarContainer .day.today .workout").length).toBe(1);

                $mainRegion.find("#calendarContainer .day.today .workout").trigger("mouseup");

                expect($body.find(".workoutQuickView").length).toBe(1);
                expect($body.find(".workoutFileUploadMenu").length).toBe(0);
                expect($body.find(".deleteConfirmation").length).toBe(0);

                $body.find(".addAttachment").trigger("click");
                expect($body.find(".workoutFileUploadMenu").length).toBe(1);
                expect($body.find(".deleteConfirmation").length).toBe(0);

            });
        });

    });


});
