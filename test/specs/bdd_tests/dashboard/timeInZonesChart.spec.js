define(
[
    "underscore",
    "jquery",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "views/dashboard/chartUtils",
    "testUtils/sharedSpecs/sharedChartSpecs"
],
function(
    _,
    $,
    testHelpers,
    xhrData,
    chartUtils,
    SharedChartSpecs
    )
{

    describe("Time In Zones Charts", function()
    {
        var chartTypes =
        [
            17, // HR Zones
            24, // Power Zones
            26  // Speed Zones
        ];

        _.each(chartTypes, function(chartType)
        {
            describe("chart type: " + chartType, function() {
                SharedChartSpecs.chartSettings({
                    chartType: chartType
                });
            });
        });
    });

    describe("Time In Zones Chart", function()
    {
        var $mainRegion;

        var timeInHeartRateZonesPodSettings = {
            index: 0,
            chartType: 17,
            dateOptions: {
                quickDateSelectOption: 1,
                startDate: null,
                endDate: null
            },
            workoutTypeIds: []
        };

        describe("One time in HR zones pod", function()
        {

            beforeEach(function()
            {
                var userData = xhrData.users.barbkprem;
                testHelpers.startTheAppAndLogin(testHelpers.deepClone(userData));
                testHelpers.theApp.user.getDashboardSettings().set("pods", [timeInHeartRateZonesPodSettings]);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                testHelpers.theApp.router.navigate("dashboard", true);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should display one dashboard chart", function()
            {
                expect($mainRegion.find(".dashboardChart").length).to.equal(1);
                expect($mainRegion.find(".dashboardChart.timeInZones").length).to.equal(1);
            });

            it("Should request time in zones data", function()
            {
                expect(testHelpers.hasRequest("POST", "reporting/timeinzones")).to.equal(true);
            });

            // these checkboxes aren't behaving right here, but they're working in the app
            describe("Chart workout type settings", function()
            {

                it("Should open the settings tomahawk", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    expect($body.find(".dashboardChartSettings").length).to.equal(0);
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    expect($body.find(".timeInZonesChartSettings").length).to.equal(1);
                });

                it("Should have workout type checkboxes in the settings tomahawk", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    expect($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox]").length).to.not.equal(0);
                });

                xit("Should retain workout type settings when reopening settings view (TODO: fix checkbox handling for this test)", function()
                {

                    // open settings, uncheck 'all workout types', and check swim
                    var $body = testHelpers.theApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    if($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").is(":checked"))
                    {
                        $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").trigger("click");
                    }
                    expect($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").is(":checked")).to.equal(false);
                    $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").trigger("click");
                    expect($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").is(":checked")).to.equal(true);
                    $body.find(".timeInZonesChartSettings .closeIcon").trigger("click");

                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    expect($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").is(":checked")).to.equal(false);
                    expect(testHelpers.theApp.user.getDashboardSettings().get("pods.0.workoutTypeIds").length).to.equal(1);
                    expect(testHelpers.theApp.user.getDashboardSettings().get("pods.0.workoutTypeIds.0")).to.eql(1);
                    expect($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").is(":checked")).to.equal(true);

                });

                it("Should save user settings", function()
                {
                    testHelpers.clearRequests();
                    // open settings, uncheck 'all workout types', and check swim
                    var $body = testHelpers.theApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    if($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").is(":checked"))
                    {
                        $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").trigger("click");
                    }
                    $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").trigger("click");
                    $body.find(".timeInZonesChartSettings .closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("PUT", "settings/dashboard")).to.equal(true);
                });

                xit("Should update chart title after changing workout type (TODO: fix checkbox handling for this test)", function()
                {
                    expect($mainRegion.find(".dashboardChart.timeInZones .chartTitle").text()).to.contain("All");
                    expect($mainRegion.find(".dashboardChart.timeInZones .chartTitle").text()).to.not.contain("Swim");

                    // open settings, uncheck 'all workout types', and check swim
                    var $body = testHelpers.theApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    if($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").is(":checked"))
                    {
                        $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").trigger("click");
                    }
                    $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").trigger("click");
                    $body.find(".timeInZonesChartSettings .closeIcon").trigger("click");
                    testHelpers.resolveRequest("POST", "reporting/timeinzones", {});
                    expect($mainRegion.find(".dashboardChart.timeInZones .chartTitle").text()).to.not.contain("All");
                    expect($mainRegion.find(".dashboardChart.timeInZones .chartTitle").text()).to.contain("Swim");
                });

                xit("Should request new data after changing workout type (TODO: fix checkbox handling for this test)", function()
                {
                    testHelpers.clearRequests();
                    // open settings, uncheck 'all workout types', and check swim
                    var $body = testHelpers.theApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.timeInZones .settings").trigger("mousedown");
                    if($body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").is(":checked"))
                    {
                        $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=0]").trigger("click");
                    }
                    $body.find(".timeInZonesChartSettings .workoutType input[type=checkbox][data-workouttypeid=1]").trigger("click");
                    $body.find(".timeInZonesChartSettings .closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("POST", "reporting/timeinzones")).to.equal(true);
                });


            });

        });

        describe("Three Different Time In Zones Charts", function()
        {
            var timeInHeartRateZonesPodSettings = {
                index: 0,
                chartType: 17,
                dateOptions: {
                    quickDateSelectOption: 1,
                    startDate: null,
                    endDate: null
                },
                workoutTypeIds: []
            };

            var timeInPowerZonesPodSettings = {
                index: 0,
                chartType: 24,
                dateOptions: {
                    quickDateSelectOption: 1,
                    startDate: null,
                    endDate: null
                },
                workoutTypeIds: []
            };

            var timeInSpeedZonesPodSettings = {
                index: 0,
                chartType: 26,
                dateOptions: {
                    quickDateSelectOption: 1,
                    startDate: null,
                    endDate: null
                },
                workoutTypeIds: []
            };

            beforeEach(function()
            {
                var userData = xhrData.users.barbkprem;
                testHelpers.startTheAppAndLogin(testHelpers.deepClone(userData));
                testHelpers.theApp.user.getDashboardSettings().set("pods", [timeInHeartRateZonesPodSettings, timeInPowerZonesPodSettings, timeInSpeedZonesPodSettings]);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                testHelpers.theApp.router.navigate("dashboard", true);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should have three pods", function()
            {
                expect($mainRegion.find(".dashboardChart").length).to.equal(3);
                expect($mainRegion.find(".dashboardChart.timeInZones").length).to.equal(3);
            });

            it("Should have correct titles in pods", function()
            {
                expect($($mainRegion.find(".dashboardChart.timeInZones")[0]).find(".chartTitle").text()).to.contain("Heart Rate");
                expect($($mainRegion.find(".dashboardChart.timeInZones")[1]).find(".chartTitle").text()).to.contain("Power");
                expect($($mainRegion.find(".dashboardChart.timeInZones")[2]).find(".chartTitle").text()).to.contain("Speed");
            });

            it("Should request correct data type for each pod", function()
            {
                var tizRequests = testHelpers.findAllRequests("POST", "reporting/timeinzones");
                expect(tizRequests.length).to.equal(3);
                expect(JSON.parse(tizRequests[0].requestBody).timeInZonesType).to.eql(1);
                expect(JSON.parse(tizRequests[1].requestBody).timeInZonesType).to.eql(2);
                expect(JSON.parse(tizRequests[2].requestBody).timeInZonesType).to.eql(3);
            });

        });

    });

});
