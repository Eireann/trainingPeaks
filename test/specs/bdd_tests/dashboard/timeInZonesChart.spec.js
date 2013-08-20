// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app",
    "views/dashboard/chartUtils"
],
function(
    _,
    testHelpers,
    xhrData,
    theMarsApp,
    chartUtils
    )
{

    describe("Time In Zones Chart", function()
    {
        var $mainRegion;

        var timeInHeartRateZonesPodSettings = {
            index: 0,
            chartType: 17,
            title: "Time In HR Zones",
            dateOptions: {
                quickDateSelectOption: 1,
                startDate: null,
                endDate: null
            },
            workoutTypeIds: null
        };

        describe("One time in HR zones pod", function()
        {

            beforeEach(function()
            {
                var userData = xhrData.users.barbkprem;
                testHelpers.startTheAppAndLogin(userData, true);
                theMarsApp.user.set("settings.dashboard.pods", [timeInHeartRateZonesPodSettings]);
                $mainRegion = theMarsApp.mainRegion.$el;
                theMarsApp.router.navigate("dashboard", true);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should display one dashboard chart", function()
            {
                expect($mainRegion.find(".dashboardChart").length).toBe(1);
                expect($mainRegion.find(".dashboardChart.timeInZones").length).toBe(1);
            });

            it("Should request time in zones data", function()
            {
                expect(testHelpers.hasRequest("POST", "reporting/timeinzones")).toBe(true);
            });

            describe("Chart workout type settings", function()
            {

                it("Should open the settings tomahawk", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    expect($body.find(".dashboardChartSettings").length).toBe(0);
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    expect($body.find(".timeInZonesChartSettings").length).toBe(1);
                });

                it("Should have workout type checkboxes in the settings tomahawk", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    expect($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox]").length).not.toBe(0);
                });

                it("Should retain workout type settings when reopening settings view", function()
                {

                    // open settings, uncheck 'all workout types', and check swim
                    var $body = theMarsApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    if($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").is(":checked"))
                    {
                        $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").trigger("click");
                    }
                    expect($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").is(":checked")).toBe(false);
                    $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").trigger("click");
                    expect($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").is(":checked")).toBe(true);
                    $body.find(".timeInZonesChartSettings #closeIcon").trigger("click");

                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    expect($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").is(":checked")).toBe(false);
                    console.log(theMarsApp.user.get("settings.dashboard.pods"));
                    expect(theMarsApp.user.get("settings.dashboard.pods.0.workoutTypeIds").length).toBe(1);
                    expect(theMarsApp.user.get("settings.dashboard.pods.0.workoutTypeIds.0")).toEqual(1);
                    expect($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").is(":checked")).toBe(true);
                    console.log($body.find(".timeInZonesChartSettings").html());

                });

                it("Should save user settings", function()
                {
                    testHelpers.clearRequests();
                    // open settings, uncheck 'all workout types', and check swim
                    var $body = theMarsApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    if($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").is(":checked"))
                    {
                        $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").trigger("click");
                    }
                    $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").trigger("click");
                    $body.find(".timeInZonesChartSettings #closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("PUT", "user")).toBe(true);
                });

                it("Should update chart title after changing workout type", function()
                {
                    expect($mainRegion.find(".dashboardChart.timeInZones .chartTitle").text()).toContain("All");
                    expect($mainRegion.find(".dashboardChart.timeInZones .chartTitle").text()).not.toContain("Swim");

                    // open settings, uncheck 'all workout types', and check swim
                    var $body = theMarsApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    if($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").is(":checked"))
                    {
                        $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").trigger("click");
                    }
                    $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").trigger("click");
                    $body.find(".timeInZonesChartSettings #closeIcon").trigger("click");
                    testHelpers.resolveRequest("POST", "reporting/timeinzones", {});
                    expect($mainRegion.find(".dashboardChart.timeInZones .chartTitle").text()).not.toContain("All");
                    expect($mainRegion.find(".dashboardChart.timeInZones .chartTitle").text()).toContain("Swim");
                });

                it("Should request new data after changing workout type", function()
                {
                    testHelpers.clearRequests();
                    // open settings, uncheck 'all workout types', and check swim
                    var $body = theMarsApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    if($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").is(":checked"))
                    {
                        $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").trigger("click");
                    }
                    $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").trigger("click");
                    $body.find(".timeInZonesChartSettings #closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("POST", "reporting/timeinzones")).toBe(true);
                });


            });

        });

        describe("Three Different Time In Zones Charts", function()
        {
            var timeInHeartRateZonesPodSettings = {
                index: 0,
                chartType: 17,
                title: "Time In HR Zones",
                dateOptions: {
                    quickDateSelectOption: 1,
                    startDate: null,
                    endDate: null
                },
                workoutTypeIds: null
            };

            it("Should have three pods", function()
            {
                expect("FIX ME").toBe(true);
            });

            it("Should have correct titles in pods", function()
            {
                expect("FIX ME").toBe(true);
            });

            it("Should request correct data type for each pod", function()
            {
                expect("FIX ME").toBe(true);
            });

        });

    });

});
