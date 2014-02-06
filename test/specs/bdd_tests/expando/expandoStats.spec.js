define(
[
    "moment",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "testUtils/AppTestData/GET_DetailData_139251189"
],
function(
    moment,
    testHelpers,
    xhrData,
    detailData
)
{

    describe("Expando", function()
    {

        describe("Stats and Laps", function()
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
                    workoutDay: moment.local().format("YYYY-MM-DD"),
                    title: "Today's workout",
                    workoutTypeValueId: 2,
                    athleteId: 426489
                };

                testHelpers.resolveRequest("GET", "workouts/" + moment.local().startOf("week").format("YYYY-MM-DD"), [workout]);
                testHelpers.resolveRequest("GET", "timedmetrics/" + moment.local().startOf("week").format("YYYY-MM-DD"), []);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should display the expando", function(done)
            {
                Q()
                .then(function()
                {
                    $mainRegion.find("#calendarContainer .day.today .workout").trigger("mouseup");
                    // open the qv
                    expect($body.find(".workoutQuickView").is(".expanded")).to.equal(false);
                })
                .until(function()
                {
                    return testHelpers.hasRequest("GET", "detaildata");
                }, "Detail Data was never requested")
                .then(function()
                {
                    // load detaildata
                    testHelpers.resolveRequest("GET", "detaildata", detailData);

                    // click to expand
                    $body.find(".workoutQuickView .expandButton").trigger("click");
                })
                .until(function()
                {
                    return $body.find(".workoutQuickView.expanded").length === 1;
                }, "Expando was never expanded")
                .then(function()
                {
                    expect($body.find(".workoutQuickView").is(".expanded")).to.equal(true);
                })
                .nodeify(done);

            });

            it("Should display a list of laps", function(done)
            {

                // open the qv
                Q()
                .then(function()
                {
                    $mainRegion.find("#calendarContainer .day.today .workout").trigger("mouseup");
                })
                .until(function()
                {
                    return testHelpers.hasRequest("GET", "detaildata");
                }, "Detail Data was never requested")
                .then(function()
                {
                    // load detaildata
                    testHelpers.resolveRequest("GET", "detaildata", detailData);

                    // click to expand
                    $body.find(".workoutQuickView .expandButton").trigger("click");
                })
                .until(function()
                {
                    return $body.find(".workoutQuickView.expanded").length === 1;
                }, "Expando was never expanded")
                .until(function()
                {
                    return $body.find(".workoutQuickView .expandoLapsRegion").length === 1;
                }, "Laps region was never rendered")
                .then(function()
                {
                    expect($body.find(".workoutQuickView .expandoLapsRegion").length).to.equal(1);
                    expect($body.find(".workoutQuickView .expandoLapsRegion").text()).to.contain("Entire Workout");
                    expect($body.find(".workoutQuickView .expandoLapsRegion").text()).to.contain("Lap 1");
                })
                .nodeify(done);

            });

            it("Should display stats if they have values, or -- if they are in the master set but have no values", function(done)
            {

                Q()
                .then(function()
                {
                    $mainRegion.find("#calendarContainer .day.today .workout").trigger("mouseup");
                })
                .until(function()
                {
                    return testHelpers.hasRequest("GET", "detaildata");
                }, "Detail Data was never requested")
                .then(function()
                {
                    // load detaildata
                    testHelpers.resolveRequest("GET", "detaildata", detailData);

                    // click to expand
                    $body.find(".workoutQuickView .expandButton").trigger("click");
                })
                .until(function()
                {
                    return $body.find(".workoutQuickView.expanded").length === 1;
                }, "Expando was never expanded")
                .until(function()
                {
                    return $body.find(".workoutQuickView .expandoStatsRegion").length === 1;
                }, "Stats region was never rendered")
                .then(function()
                {
                    var expandoStatsText = $body.find(".workoutQuickView .expandoStatsRegion").text().replace(/\n|\r/g," ").replace(/ +/g," ");
                    expect($body.find(".workoutQuickView .expandoStatsRegion").length).to.equal(1);
                    expect(expandoStatsText).to.contain("Entire Workout");
                    expect(expandoStatsText).to.contain("TSS 74.4");
                    expect(expandoStatsText).to.not.contain("Work --");

                    expect(expandoStatsText).to.not.contain("Lap 1");
                    expect(expandoStatsText).to.not.contain("TSS --");

                    $body.find(".workoutQuickView .expandoLapsRegion .lap:not(.total):first").trigger("click");
                    expandoStatsText = $body.find(".workoutQuickView .expandoStatsRegion").text().replace(/\n|\r/g," ").replace(/ +/g," ");

                    expect(expandoStatsText).to.not.contain("Entire Workout");
                    expect(expandoStatsText).to.not.contain("TSS 74.4");
                    expect(expandoStatsText).to.not.contain("Work --");

                    expect(expandoStatsText).to.contain("Lap 1");
                    expect(expandoStatsText).to.contain("TSS --");
                })
                .nodeify(done);

            });
        });

    });


});
