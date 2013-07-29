// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "moment",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "testUtils/AppTestData/GET_DetailData_134283074",
    "app"
],
function(
    moment,
    testHelpers,
    xhrData,
    detailData,
    theApp)
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
                $mainRegion = theApp.mainRegion.$el;
                $body = theApp.getBodyElement();
                theApp.router.navigate("calendar", true);

                var workout = {
                    workoutId: 1,
                    workoutDay: moment().format("YYYY-MM-DD"),
                    title: "Today's workout",
                    workoutTypeValueId: 2,
                    athleteId: 426489
                };

                testHelpers.resolveRequest("GET", "workouts/" + moment().day(1).format("YYYY-MM-DD"), [workout]);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should display the expando", function()
            {

                // open the qv
                runs(function()
                {
                    $mainRegion.find("#calendarContainer .day.today .workout").trigger("mouseup");
                    // open the qv
                    expect($body.find(".workoutQuickView").is(".expanded")).toBe(false);
                });

                // wait for detail data reqeust
                waitsFor(function()
                {
                    return testHelpers.hasRequest("GET", "detaildata");
                }, "Detail Data was never requested", 5000);
               
                runs(function()
                {
                    // load detaildata
                    testHelpers.resolveRequest("GET", "detaildata", detailData);

                    // click to expand
                    $body.find(".workoutQuickView .expandButton").trigger("click");
                });

                // wait for expansion
                waitsFor(function()
                {
                    return $body.find(".workoutQuickView.expanded").length === 1;
                }, "Expando was never expanded", 5000);

                runs(function()
                {
                    expect($body.find(".workoutQuickView").is(".expanded")).toBe(true);
                });
            });

            it("Should display a list of laps", function()
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
                    // load detaildata
                    testHelpers.resolveRequest("GET", "detaildata", detailData);

                    // click to expand
                    $body.find(".workoutQuickView .expandButton").trigger("click");
                });

                // wait for expansion
                waitsFor(function()
                {
                    return $body.find(".workoutQuickView.expanded").length === 1;
                }, "Expando was never expanded", 5000);

                // wait for laps
                waitsFor(function()
                {
                    return $body.find(".workoutQuickView #expandoLapsRegion").length === 1;
                }, "Laps region was never rendered", 5000);

                runs(function()
                {
                    expect($body.find(".workoutQuickView #expandoLapsRegion").length).toBe(1);
                    expect($body.find(".workoutQuickView #expandoLapsRegion").text()).toContain("Entire Workout");
                    expect($body.find(".workoutQuickView #expandoLapsRegion").text()).toContain("Lap #1")
                });

            });
        });

    });


});