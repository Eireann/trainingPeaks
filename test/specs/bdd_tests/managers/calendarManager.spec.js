// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app",
    "moment",
    "shared/managers/calendarManager",
    "framework/dataManager",
    "models/workoutModel",
    "shared/models/metricModel"
],
function(
    testHelpers,
    xhrData,
    theMarsApp,
    moment,
    CalendarManager,
    DataManager,
    WorkoutModel,
    MetricModel
)
{

    describe("CalendarManager (BDD)", function()
    {

        var calendarManager, dataManager;
        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            dataManager = theMarsApp.dataManager;
            calendarManager = theMarsApp.calendarManager;
        });

        describe(".loadActivites", function()
        {

            var weeks;
            beforeEach(function()
            {
                calendarManager.loadActivities("2013-09-30", "2013-10-07");

                weeks = [
                    calendarManager.weeks.get("2013-09-30"),
                    calendarManager.weeks.get("2013-10-07")
                ];
            });

            it("should update flags (by week), with success", function()
            {

                expect(weeks[0].getState().get("isWaiting")).toBe(true);
                expect(weeks[1].getState().get("isWaiting")).toBe(true);

                testHelpers.resolveRequest("GET", "/workouts/2013-09-30", []);
                testHelpers.resolveRequest("GET", "/timedmetrics/2013-09-30", []);

                expect(weeks[0].getState().get("isWaiting")).toBe(false);
                expect(weeks[1].getState().get("isWaiting")).toBe(true);
                
                expect(weeks[0].getState().get("isFetched")).toBe(true);
                expect(weeks[1].getState().get("isFetched")).toBe(false);

                testHelpers.resolveRequest("GET", "/workouts/2013-10-07", []);
                testHelpers.resolveRequest("GET", "/timedmetrics/2013-10-07", []);

                expect(weeks[0].getState().get("isWaiting")).toBe(false);
                expect(weeks[1].getState().get("isWaiting")).toBe(false);
                
                expect(weeks[0].getState().get("isFetched")).toBe(true);
                expect(weeks[1].getState().get("isFetched")).toBe(true);

            });

            it("should not refetch weeks", function()
            {

                testHelpers.resolveRequest("GET", "/workouts/2013-09-30", []);
                testHelpers.resolveRequest("GET", "/timedmetrics/2013-09-30", []);

                testHelpers.resolveRequest("GET", "/workouts/2013-10-07", []);
                testHelpers.resolveRequest("GET", "/timedmetrics/2013-10-07", []);

                testHelpers.clearRequests();
                calendarManager.loadActivities("2013-09-30", "2013-10-07");

                expect(testHelpers.hasRequest("GET", "/workouts/2013-09-30")).toBe(false);
                expect(testHelpers.hasRequest("GET", "/timedmetrics/2013-09-30")).toBe(false);
                expect(testHelpers.hasRequest("GET", "/workouts/2013-10-07")).toBe(false);
                expect(testHelpers.hasRequest("GET", "/timedmetrics/2013-10-07")).toBe(false);

            });

            // Need to fix data manager to pass through failures
            xit("should update flags (by week), with failure", function()
            {

                testHelpers.rejectRequest("GET", "/workouts/2013-09-30");
                testHelpers.resolveRequest("GET", "/timedmetrics/2013-09-30", []);

                expect(weeks[0].getState().get("isWaiting")).toBe(false);
                expect(weeks[1].getState().get("isWaiting")).toBe(true);

                expect(weeks[0].getState().get("isFailed")).toBe(true);
                expect(weeks[1].getState().get("isFailed")).toBe(false);

                testHelpers.resolveRequest("GET", "/workouts/2013-10-07", []);
                testHelpers.rejectRequest("GET", "/timedmetrics/2013-10-07");

                expect(weeks[0].getState().get("isWaiting")).toBe(false);
                expect(weeks[1].getState().get("isWaiting")).toBe(false);

                expect(weeks[0].getState().get("isFailed")).toBe(true);
                expect(weeks[1].getState().get("isFailed")).toBe(true);

            });

        });

    });

});
