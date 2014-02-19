define(
[
    "underscore",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "TP",
    "views/dashboard/chartUtils",
    "testUtils/sharedSpecs/sharedChartSpecs"
],
function(
    _,
    testHelpers,
    xhrData,
    TP,
    chartUtils,
    SharedChartSpecs
    )
{

    describe("Fitness Summary Chart", function()
    {

        SharedChartSpecs.chartSettings(
        {
            chartType: 3
        });

    });

    var applyDashboardDates = function($mainRegion, $body, dateOptionId, startDate, endDate)
    {
        startDate = TP.utils.datetime.format(startDate);
        endDate = TP.utils.datetime.format(endDate);
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
                testHelpers.startTheAppAndLogin(testHelpers.deepClone(userData));
                testHelpers.theApp.user.getDashboardSettings().set("pods", [fitnessSummaryPodSettings]);
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                testHelpers.theApp.router.navigate("dashboard", true);
                $body = testHelpers.theApp.getBodyElement();
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should display one dashboard chart", function()
            {
                expect($mainRegion.find(".dashboardChart").length).to.equal(1);
                expect($mainRegion.find(".dashboardChart.fitnessSummaryChart").length).to.equal(1);
            });

            it("Should request fitness summary data", function()
            {
                expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary")).to.equal(true);
            });

            describe("Chart date settings", function()
            {
                it("Should open the settings tomahawk", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    expect($body.find(".dashboardChartSettings").length).to.equal(0);
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings").length).to.equal(1);
                });

                it("Should have a date picker in the settings tomahawk", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings .dashboardDatePicker").length).to.equal(1);
                });

                it("Should close when clicking on the close icon", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    expect($body.find(".dashboardChartSettings").length).to.equal(0);
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings").length).to.equal(1);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect($body.find(".dashboardChartSettings").length).to.equal(0);
                });

                it("Should save the user settings on settings close", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    testHelpers.clearRequests();
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect(testHelpers.hasRequest("PUT", "settings/dashboard")).to.equal(false);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("PUT", "settings/dashboard")).to.equal(true);
                });

                it("Should not request new data on settings close if parameters haven't changed", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    testHelpers.clearRequests();
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary")).to.equal(false);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary")).to.equal(false);
                });

                it("Should use dates entered in settings tomahawk", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();

                    // set dashboard dates
                    applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2013-01-01", "2013-04-15");
                    testHelpers.clearRequests();

                    // set tomahawk dates
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    $body.find(".dashboardChartSettings .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                    $body.find(".dashboardChartSettings .dashboardDatePicker input.startDate").val(TP.utils.datetime.format("2012-04-01")).trigger("change");
                    $body.find(".dashboardChartSettings .dashboardDatePicker input.endDate").val(TP.utils.datetime.format("2012-12-24")).trigger("change");
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");

                    // should request tomahawk dates
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary/2012-04-01/2012-12-24")).to.equal(true);

                    // should not request dashboard dates
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary/2013-01-01/2013-04-15")).to.equal(false);

                });

            });

            describe("Apply dashboard dates", function()
            {

                var fitnessSummaryPodSettingsThree = {
                    index: 0,
                    chartType: 3,
                    dateOptions: {
                        quickDateSelectOption: 1,
                        startDate: null,
                        endDate: null
                    }
                };
        
                beforeEach(function()
                {
                    var userData = xhrData.users.barbkprem;
                    testHelpers.startTheAppAndLogin(testHelpers.deepClone(userData));
                    testHelpers.theApp.user.getDashboardSettings().set("pods", [fitnessSummaryPodSettingsThree]);
                    $mainRegion = testHelpers.theApp.mainRegion.$el;
                    testHelpers.theApp.router.navigate("dashboard", true);
                    $body = testHelpers.theApp.getBodyElement();
                });

                afterEach(function()
                {
                    testHelpers.stopTheApp();
                });

                it("Should update when dashboard dates are updated", function()
                {
                    testHelpers.clearRequests();
                    testHelpers.theApp.dataManager.forceReset();
                    applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2012-01-01", "2016-04-15");
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary")).to.equal(true);   
                    expect(testHelpers.hasRequest("GET", "reporting/fitnesssummary/2012-01-01/2016-04-15")).to.equal(true);
                });

            });

            describe("Report Type", function()
            {

                it("Should default to Planned Distance", function()
                {
                    expect($mainRegion.find(".dashboardChart.fitnessSummaryChart").text()).to.contain("Planned Distance");
                });

                it("Should update chart when settings are changed", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();

                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    $body.find(".dashboardChartSettings select.summaryType").val("2").trigger("change");
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");

                    testHelpers.resolveRequest("GET", "reporting/fitnesssummary", []);

                    expect($mainRegion.find(".dashboardChart.fitnessSummaryChart").text()).to.contain("Completed Distance");

                });

                it("Should retain the selected report type in the settings tomahawk", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    $body.find(".dashboardChartSettings select.summaryType").val("3").trigger("change");
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings select.summaryType").val()).to.eql("3");
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
                    dateOptions: {
                        quickDateSelectOption: 1,
                        startDate: null,
                        endDate: null
                    }
                };

                var fitnessSummaryPodSettingsTwo = {
                    index: 1,
                    chartType: 3,
                    dateOptions: {
                        quickDateSelectOption: 1,
                        startDate: null,
                        endDate: null
                    }
                };

                beforeEach(function()
                {
                    var userData = xhrData.users.barbkprem;
                    testHelpers.startTheAppAndLogin(testHelpers.deepClone(userData));
                    testHelpers.theApp.user.getDashboardSettings().set("pods", [fitnessSummaryPodSettings, fitnessSummaryPodSettingsTwo]);
                    $mainRegion = testHelpers.theApp.mainRegion.$el;
                    testHelpers.theApp.router.navigate("dashboard", true);
                    $body = testHelpers.theApp.getBodyElement();
                });

                afterEach(function()
                {
                    testHelpers.stopTheApp();
                });

                it("Should display two dashboard charts", function()
                {
                    expect($mainRegion.find(".dashboardChart").length).to.equal(2);
                    expect($mainRegion.find(".dashboardChart.fitnessSummaryChart").length).to.equal(2);
                });

                it("Should share data across multiple charts", function()
                {
                    var fitnessSummaryRequests = testHelpers.findAllRequests("GET", "reporting/fitnesssummary");
                    expect(fitnessSummaryRequests.length).to.equal(1);
                });
            });

            describe("Charts with different request parameters", function()
            {
                var fitnessSummaryPodSettings = {
                    index: 0,
                    chartType: 3,
                    dateOptions: {
                        quickDateSelectOption: 1,
                        startDate: null,
                        endDate: null
                    }
                };

                var fitnessSummaryPodSettingsTwo = {
                    index: 1,
                    chartType: 3,
                    dateOptions: {
                        quickDateSelectOption: 8,
                        startDate: null,
                        endDate: null
                    }
                };

                beforeEach(function()
                {
                    var userData = xhrData.users.barbkprem;
                    testHelpers.startTheAppAndLogin(testHelpers.deepClone(userData));
                    testHelpers.theApp.user.getDashboardSettings().set("pods", [fitnessSummaryPodSettings, fitnessSummaryPodSettingsTwo]);
                    $mainRegion = testHelpers.theApp.mainRegion.$el;
                    testHelpers.theApp.router.navigate("dashboard", true);
                    $body = testHelpers.theApp.getBodyElement();
                });

                afterEach(function()
                {
                    testHelpers.stopTheApp();
                });

                it("Should display two dashboard charts", function()
                {
                    expect($mainRegion.find(".dashboardChart").length).to.equal(2);
                    expect($mainRegion.find(".dashboardChart.fitnessSummaryChart").length).to.equal(2);
                });

                it("Should not share data across multiple charts", function()
                {
                    var fitnessSummaryRequests = testHelpers.findAllRequests("GET", "reporting/fitnesssummary");
                    expect(fitnessSummaryRequests.length).to.equal(2);
                });
            });

        });
    });

});
