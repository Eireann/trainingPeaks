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

    var applyDashboardDates = function($mainRegion, $body, dateOptionId, startDate, endDate)
    {
        $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
        $body.find(".dashboardHeaderDatePicker .dashboardDatePicker select.dateOptions").val(dateOptionId).trigger("change");
        $body.find(".dashboardHeaderDatePicker .dashboardDatePicker input.startDate").val(startDate).trigger("change");
        $body.find(".dashboardHeaderDatePicker .dashboardDatePicker input.endDate").val(endDate).trigger("change");
        $body.find(".dashboardHeaderDatePicker .closeIcon").trigger("click");
    };

    describe("Fitness Summary Chart", function()
    {
        var $mainRegion;
        var $body;

        var fitnessSummaryPodSettings = {
            index: 0,
            chartType: 3,
            title: "Fitness Summary",
            dateOptions: {
                quickDateSelectOption: 1,
                startDate: null,
                endDate: null
            }
        };

        describe("One fitness summary pod", function()
        {

            beforeEach(function()
            {
                var userData = xhrData.users.barbkprem;
                testHelpers.startTheAppAndLogin(userData, true);
                theMarsApp.user.getDashboardSettings().set("pods", [fitnessSummaryPodSettings]);
                $mainRegion = theMarsApp.mainRegion.$el;
                theMarsApp.router.navigate("dashboard", true);
                $body = theMarsApp.getBodyElement();
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should display one dashboard chart", function()
            {
                expect($mainRegion.find(".dashboardChart").length).toBe(1);
                expect($mainRegion.find(".dashboardChart.fitnessSummaryChart").length).toBe(1);
            });

            it("Should request fitness summary data", function()
            {
                expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary")).toBe(true);
            });

            describe("Chart date settings", function()
            {
                it("Should open the settings tomahawk", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    expect($body.find(".dashboardChartSettings").length).toBe(0);
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings").length).toBe(1);
                });

                it("Should have a date picker in the settings tomahawk", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings .dashboardDatePicker").length).toBe(1);
                });

                it("Should close when clicking on the close icon", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    expect($body.find(".dashboardChartSettings").length).toBe(0);
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings").length).toBe(1);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect($body.find(".dashboardChartSettings").length).toBe(0);
                });

                it("Should save the user settings on settings close", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    testHelpers.clearRequests();
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect(testHelpers.hasRequest("PUT", "settings/dashboard")).toBe(false);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("PUT", "settings/dashboard")).toBe(true);
                });

                it("Should not request new data on settings close if parameters haven't changed", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    testHelpers.clearRequests();
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary")).toBe(false);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary")).toBe(false);
                });

                it("Should use dates entered in settings tomahawk", function()
                {
                    var $body = theMarsApp.getBodyElement();

                    // set dashboard dates
                    applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2013-01-01", "2013-04-15");
                    testHelpers.clearRequests();

                    // set tomahawk dates
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    $body.find(".dashboardChartSettings .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                    $body.find(".dashboardChartSettings .dashboardDatePicker input.startDate").val("2012-04-01").trigger("change");
                    $body.find(".dashboardChartSettings .dashboardDatePicker input.endDate").val("2012-12-24").trigger("change");
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");

                    // should request tomahawk dates
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary/2012-04-01/2012-12-24")).toBe(true);

                    // should not request dashboard dates
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary/2013-01-01/2013-04-15")).toBe(false);

                });

            });

            describe("Apply dashboard dates", function()
            {

                var fitnessSummaryPodSettingsThree = {
                    index: 0,
                    chartType: 3,
                    title: "Fitness Summary",
                    dateOptions: {
                        quickDateSelectOption: 1,
                        startDate: null,
                        endDate: null
                    }
                };
        
                beforeEach(function()
                {
                    var userData = xhrData.users.barbkprem;
                    testHelpers.startTheAppAndLogin(userData, true);
                    theMarsApp.user.getDashboardSettings().set("pods", [fitnessSummaryPodSettingsThree]);
                    $mainRegion = theMarsApp.mainRegion.$el;
                    theMarsApp.router.navigate("dashboard", true);
                    $body = theMarsApp.getBodyElement();
                });

                afterEach(function()
                {
                    testHelpers.stopTheApp();
                });

                it("Should update when dashboard dates are updated", function()
                {
                    testHelpers.clearRequests();
                    theMarsApp.dataManagers.reporting.forceReset();
                    applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2012-01-01", "2016-04-15");
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary")).toBe(true);   
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary/2012-01-01/2016-04-15")).toBe(true);
                });

            });

            describe("Report Type", function()
            {
                it("Should default to Planned Distance", function()
                {
                    expect($mainRegion.find(".dashboardChart.fitnessSummaryChart").text()).toContain("Planned Distance");
                });

                it("Should update chart when settings are changed", function()
                {
                    var $body = theMarsApp.getBodyElement();

                    runs(function()
                    {
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                        $body.find(".dashboardChartSettings select.summaryType").val("2").trigger("change");
                        $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    });

                    waitsFor(function()
                    {
                        return $mainRegion.find(".dashboardChart.fitnessSummaryChart").text().indexOf("Completed Distance") > 0;
                    });

                    runs(function()
                    {
                        expect($mainRegion.find(".dashboardChart.fitnessSummaryChart").text()).toContain("Completed Distance");
                    });

                    
                });

                it("Should retain the selected report type in the settings tomahawk", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    $body.find(".dashboardChartSettings select.summaryType").val("3").trigger("change");
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings select.summaryType").val()).toEqual("3");
                });
            });

        });

        describe("Reporting Data Manager", function()
        {
            describe("Charts with same request parameters", function()
            {
                var fitnessSummaryPodSettings = {
                    index: 0,
                    chartType: 3,
                    title: "Fitness Summary",
                    dateOptions: {
                        quickDateSelectOption: 1,
                        startDate: null,
                        endDate: null
                    }
                };

                var fitnessSummaryPodSettingsTwo = {
                    index: 1,
                    chartType: 3,
                    title: "Fitness Summary",
                    dateOptions: {
                        quickDateSelectOption: 1,
                        startDate: null,
                        endDate: null
                    }
                };

                beforeEach(function()
                {
                    var userData = xhrData.users.barbkprem;
                    testHelpers.startTheAppAndLogin(userData, true);
                    theMarsApp.user.getDashboardSettings().set("pods", [fitnessSummaryPodSettings, fitnessSummaryPodSettingsTwo]);
                    $mainRegion = theMarsApp.mainRegion.$el;
                    theMarsApp.router.navigate("dashboard", true);
                    $body = theMarsApp.getBodyElement();
                });

                afterEach(function()
                {
                    testHelpers.stopTheApp();
                });

                it("Should display two dashboard charts", function()
                {
                    expect($mainRegion.find(".dashboardChart").length).toBe(2);
                    expect($mainRegion.find(".dashboardChart.fitnessSummaryChart").length).toBe(2);
                });

                it("Should share data across multiple charts", function()
                {
                    var fitnessSummaryRequests = testHelpers.findAllRequests("GET", "reporting/fitnesssummary");
                    expect(fitnessSummaryRequests.length).toBe(1);
                });
            });

            describe("Charts with different request parameters", function()
            {
                var fitnessSummaryPodSettings = {
                    index: 0,
                    chartType: 3,
                    title: "Fitness Summary",
                    dateOptions: {
                        quickDateSelectOption: 1,
                        startDate: null,
                        endDate: null
                    }
                };

                var fitnessSummaryPodSettingsTwo = {
                    index: 1,
                    chartType: 3,
                    title: "Fitness Summary",
                    dateOptions: {
                        quickDateSelectOption: 8,
                        startDate: null,
                        endDate: null
                    }
                };

                beforeEach(function()
                {
                    var userData = xhrData.users.barbkprem;
                    testHelpers.startTheAppAndLogin(userData, true);
                    theMarsApp.user.getDashboardSettings().set("pods", [fitnessSummaryPodSettings, fitnessSummaryPodSettingsTwo]);
                    $mainRegion = theMarsApp.mainRegion.$el;
                    theMarsApp.router.navigate("dashboard", true);
                    $body = theMarsApp.getBodyElement();
                });

                afterEach(function()
                {
                    testHelpers.stopTheApp();
                });

                it("Should display two dashboard charts", function()
                {
                    expect($mainRegion.find(".dashboardChart").length).toBe(2);
                    expect($mainRegion.find(".dashboardChart.fitnessSummaryChart").length).toBe(2);
                });

                it("Should not share data across multiple charts", function()
                {
                    var fitnessSummaryRequests = testHelpers.findAllRequests("GET", "reporting/fitnesssummary");
                    expect(fitnessSummaryRequests.length).toBe(2);
                });
            });

        });
    });

});
