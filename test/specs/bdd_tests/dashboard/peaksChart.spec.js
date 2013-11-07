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

    describe("Peaks Charts", function()
    {
        var chartTypes =
        [
            8, // Power
            28, // HR
            29, // Cadence
            30, // Speed
            31, // Pace
            36 // Pace by Distance
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

    describe("Peaks Chart(s)", function()
    {
        var $mainRegion;
        var $body;

        var peakPowerPodSettings = {
            index: 0,
            chartType: 8,
            title: "Peak Power",
            dateOptions: {
                quickDateSelectOption: 1,
                startDate: null,
                endDate: null
            }
        };

        describe("One peak power pod", function()
        {

            beforeEach(function()
            {
                var userData = xhrData.users.barbkprem;
                testHelpers.startTheAppAndLogin(testHelpers.deepClone(userData));
                testHelpers.theApp.user.getDashboardSettings().set("pods", [peakPowerPodSettings]);
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
                expect($mainRegion.find(".dashboardChart.peaksChart").length).to.equal(1);
            });

            it("Should request mean/max bests data", function()
            {
                expect(testHelpers.hasRequest("POST", "reporting/meanmaxbests")).to.equal(true);
            });

            describe("Chart date settings", function()
            {
                it("Should open the settings tomahawk", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    expect($body.find(".dashboardChartSettings").length).to.equal(0);
                    $mainRegion.find(".dashboardChart.peaksChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings").length).to.equal(1);
                });

                it("Should have a date picker in the settings tomahawk", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.peaksChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings .dateOptionsRegion .dashboardDatePicker").length).to.equal(1);
                    expect($body.find(".dashboardChartSettings .comparisonDateOptionsRegion .dashboardDatePicker").length).to.equal(1);
                });

                it("Should close when clicking on the close icon", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    expect($body.find(".dashboardChartSettings").length).to.equal(0);
                    $mainRegion.find(".dashboardChart.peaksChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings").length).to.equal(1);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect($body.find(".dashboardChartSettings").length).to.equal(0);
                });

                it("Should save the user settings on settings close", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    testHelpers.clearRequests();
                    $mainRegion.find(".dashboardChart.peaksChart .settings").trigger("mousedown");
                    expect(testHelpers.hasRequest("PUT", "settings/dashboard")).to.equal(false);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("PUT", "settings/dashboard")).to.equal(true);
                });

                it("Should not request new data on settings close if parameters haven't changed", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();
                    testHelpers.clearRequests();
                    $mainRegion.find(".dashboardChart.peaksChart .settings").trigger("mousedown");
                    expect(testHelpers.hasRequest("POST", "reporting/meanmaxbests")).to.equal(false);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("POST", "reporting/meanmaxbests")).to.equal(false);
                });

                it("Should use dates entered in settings tomahawk", function()
                {
                    var $body = testHelpers.theApp.getBodyElement();

                    // set dashboard dates
                    applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2013-01-01", "2013-04-15");
                    testHelpers.clearRequests();

                    // set tomahawk dates
                    $mainRegion.find(".dashboardChart.peaksChart .settings").trigger("mousedown");
                    $body.find(".dashboardChartSettings .dateOptionsRegion .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                    $body.find(".dashboardChartSettings .dateOptionsRegion .dashboardDatePicker input.startDate").val(TP.utils.datetime.format("2012-04-01")).trigger("change");
                    $body.find(".dashboardChartSettings .dateOptionsRegion .dashboardDatePicker input.endDate").val(TP.utils.datetime.format("2012-12-24")).trigger("change");
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");

                    // should request tomahawk dates
                    expect(testHelpers.hasRequest("POST", "reporting/meanmaxbests/2012-04-01/2012-12-24")).to.equal(true);

                    // should not request dashboard dates
                    expect(testHelpers.hasRequest("POST", "reporting/meanmaxbests/2013-01-01/2013-04-15")).to.equal(false);

                });

            });

            describe("Apply dashboard dates", function()
            {

                var peaksPodSettings= {
                    index: 0,
                    chartType: 8,
                    title: "PeakPower",
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
                    testHelpers.theApp.user.getDashboardSettings().set("pods", [peaksPodSettings]);
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
                    expect(testHelpers.hasRequest("POST", "reporting/meanmaxbests")).to.equal(true);   
                    expect(testHelpers.hasRequest("POST", "reporting/meanmaxbests/2012-01-01/2016-04-15")).to.equal(true);
                });

            });

        });

    });

});
