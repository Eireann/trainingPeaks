// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "jquery",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app",
    "views/dashboard/chartUtils"
],
function(
    _,
    $,
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
            chartType: 18,
            title: "Time In HR Zones by Week",
            dateOptions: {
                quickDateSelectOption: 1,
                startDate: null,
                endDate: null
            },
            workoutTypeIds: []
        };

        describe("One time in HR zones by week pod", function()
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
                expect(testHelpers.hasRequest("POST", "reporting/timeinzonesbyweek")).toBe(true);
            });

        });

        describe("Three Different Time In Zones By Week Charts", function()
        {
            var timeInHeartRateZonesPodSettings = {
                index: 0,
                chartType: 18,
                title: "Time In HR Zones by week",
                dateOptions: {
                    quickDateSelectOption: 1,
                    startDate: null,
                    endDate: null
                },
                workoutTypeIds: []
            };

            var timeInPowerZonesPodSettings = {
                index: 0,
                chartType: 25,
                title: "Time In Power Zones by week",
                dateOptions: {
                    quickDateSelectOption: 1,
                    startDate: null,
                    endDate: null
                },
                workoutTypeIds: []
            };

            var timeInSpeedZonesPodSettings = {
                index: 0,
                chartType: 27,
                title: "Time In Speed Zones by week",
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
                testHelpers.startTheAppAndLogin(userData, true);
                theMarsApp.user.set("settings.dashboard.pods", [timeInHeartRateZonesPodSettings, timeInPowerZonesPodSettings, timeInSpeedZonesPodSettings]);
                $mainRegion = theMarsApp.mainRegion.$el;
                theMarsApp.router.navigate("dashboard", true);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should have three pods", function()
            {
                expect($mainRegion.find(".dashboardChart").length).toBe(3);
                expect($mainRegion.find(".dashboardChart.timeInZones").length).toBe(3);
            });

            it("Should have correct titles in pods", function()
            {
                expect($($mainRegion.find(".dashboardChart.timeInZones")[0]).find(".chartTitle").text()).toContain("Heart Rate");
                expect($($mainRegion.find(".dashboardChart.timeInZones")[1]).find(".chartTitle").text()).toContain("Power");
                expect($($mainRegion.find(".dashboardChart.timeInZones")[2]).find(".chartTitle").text()).toContain("Speed");
            });

            it("Should request correct data type for each pod", function()
            {
                var tizRequests = testHelpers.findAllRequests("POST", "reporting/timeinzonesbyweek");
                expect(tizRequests.length).toBe(3);
                expect(JSON.parse(tizRequests[0].options.data).timeInZonesType).toEqual(1);
                expect(JSON.parse(tizRequests[1].options.data).timeInZonesType).toEqual(2);
                expect(JSON.parse(tizRequests[2].options.data).timeInZonesType).toEqual(3);
            });

        });

    });

});
