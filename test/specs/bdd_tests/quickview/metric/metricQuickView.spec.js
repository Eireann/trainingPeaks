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

    describe("metric quick view", function()
    {

        describe("For a new timed metric", function()
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

            it("Should display a 'Metrics' button in the new item view", function()
            {
                // no run button yet
                expect($body.find(".newItemView button[data]-metric").length).toBe(0);

                // click add workout
                $mainRegion.find("#calendarContainer .day.today .addWorkout").trigger("click");

                // now button shows up in new item view
                expect($body.find(".newItemView button[data-metric]").length).toBe(1);
            });

            it("Should display the quick view after clicking the metrics button in new item view", function()
            {
                // no qv yet
                expect($body.find(".workoutQuickView").length).toBe(0);

                // open new item view
                $mainRegion.find("#calendarContainer .day.today .addWorkout").trigger("click");

                // add run
                $body.find("button[data-metric]").trigger("click"); // 3=run

                // should have a qv
                expect($body.find(".metricQuickView").length).toBe(1);
            });
        });


        describe("For an existing metric", function()
        {
            var $mainRegion;
            var $body;
            
            var metric;

            beforeEach(function()
            {
                testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                $body = testHelpers.theApp.getBodyElement();
                testHelpers.theApp.router.navigate("calendar", true);

                metric = {
                    id: 1,
                    timeStamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                    athleteId: 426489,
                    details: [{
                        type: 12,
                        value: "NOTES!!!!"
                    }]
                };

                testHelpers.resolveRequest("GET", "workouts/" + moment().day(1).format("YYYY-MM-DD"), []);
                testHelpers.resolveRequest("GET", "timedmetrics/" + moment().day(1).format("YYYY-MM-DD"), [metric]);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should display a metric in today", function()
            {
                expect($mainRegion.find("#calendarContainer .day.today .metric").length).toBe(1);
            });

            it("Should display a quickview after clicking the workout", function()
            {
                $mainRegion.find("#calendarContainer .day.today .metric").trigger("mouseup");
                expect($body.find(".metricQuickView").length).toBe(1);
            });

            it("Should save the metrics and close the quickview when OK is clicked", function()
            {
                $mainRegion.find("#calendarContainer .day.today .metric").trigger("mouseup");
                expect($body.find(".metricQuickView").length).toBe(1);
                $body.find(".okButton").click();

                var request = testHelpers.findRequest("PUT", "timedmetrics/1");
                expect(JSON.parse(request.requestBody)).toEqual(metric);

                testHelpers.resolveRequest("PUT", "timedmetrics/1");
                expect($body.find(".metricQuickView").length).toBe(0);
            });

            it("Should ask, then not save the metrics and close the quickview when CANCEL is clicked", function()
            {
                $mainRegion.find("#calendarContainer .day.today .metric").trigger("mouseup");
                expect($body.find(".metricQuickView").length).toBe(1);

                $body.find(".discardButton").click();
                $body.find("#userConfirm").click();

                expect(testHelpers.hasRequest("PUT", "timedmetrics/1")).toBe(false);
                expect($body.find(".metricQuickView").length).toBe(0);
            });

            it("Should not destroy the metrics and close the quickview when DELETE is clicked", function()
            {
                $mainRegion.find("#calendarContainer .day.today .metric").trigger("mouseup");
                expect($body.find(".metricQuickView").length).toBe(1);

                $body.find(".deleteButton").click();
                $body.find("#userConfirm").click();

                expect(testHelpers.hasRequest("DELETE", "timedmetrics/1")).toBe(true);
                expect($body.find(".metricQuickView").length).toBe(0);
            });

            it("Should save and close when the user clicks outside the quickview", function()
            {
                $mainRegion.find("#calendarContainer .day.today .metric").trigger("mouseup");
                expect($body.find(".metricQuickView").length).toBe(1);
                $body.find(".modalOverlay").click();

                var request = testHelpers.findRequest("PUT", "timedmetrics/1");
                expect(JSON.parse(request.requestBody)).toEqual(metric);

                testHelpers.resolveRequest("PUT", "timedmetrics/1");
                expect($body.find(".metricQuickView").length).toBe(0);
            });

        });

    });


});

