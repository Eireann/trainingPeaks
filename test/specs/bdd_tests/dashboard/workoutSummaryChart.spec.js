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

    describe("WorkoutSummary Chart(s)", function()
    {
        _.each([10, 11, 21, 23, 37, 19, 20], function(chartType)
        {
            var podSettings = {
                chartType: chartType
            };

            describe("chartType: " + chartType, function()
            {
                beforeEach(function()
                {
                    var userData = xhrData.users.barbkprem;
                    testHelpers.startTheAppAndLogin(userData, true);
                    theMarsApp.user.set("settings.dashboard.pods", [podSettings]);
                    $mainRegion = theMarsApp.mainRegion.$el;
                    theMarsApp.router.navigate("dashboard", true);
                    $body = theMarsApp.getBodyElement();
                });


                afterEach(function()
                {
                    testHelpers.stopTheApp();
                });

                it("should display the chart", function()
                {
                    expect($mainRegion.find(".dashboardChart").length).toBe(1);
                    expect($mainRegion.find(".dashboardChart.workoutSummaryChart").length).toBe(1);
                });

            });
        });

        var $mainRegion;
        var $body;

        var workoutSummaryPodSettings = {
            index: 0,
            chartType: 10,
            title: "Workout Summary",
            dateOptions: {
                quickDateSelectOption: 1,
                startDate: null,
                endDate: null
            }
        };

        describe("One Workout Summary pod", function()
        {

            beforeEach(function()
            {
                var userData = xhrData.users.barbkprem;
                testHelpers.startTheAppAndLogin(userData, true);
                theMarsApp.user.set("settings.dashboard.pods", [workoutSummaryPodSettings]);
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
                expect($mainRegion.find(".dashboardChart.workoutSummaryChart").length).toBe(1);
            });

            it("Should request workout summary data", function()
            {
                expect(testHelpers.hasRequest("POST", "/workoutsummary/")).toBe(true);
            });

            describe("Chart date settings", function()
            {
                it("Should open the settings tomahawk", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    expect($body.find(".dashboardChartSettings").length).toBe(0);
                    $mainRegion.find(".dashboardChart.workoutSummaryChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings").length).toBe(1);
                });

                it("Should have a date picker in the settings tomahawk", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    $mainRegion.find(".dashboardChart.workoutSummaryChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings .dateOptionsRegion .dashboardDatePicker").length).toBe(1);
                });

                it("Should close when clicking on the close icon", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    expect($body.find(".dashboardChartSettings").length).toBe(0);
                    $mainRegion.find(".dashboardChart.workoutSummaryChart .settings").trigger("mousedown");
                    expect($body.find(".dashboardChartSettings").length).toBe(1);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect($body.find(".dashboardChartSettings").length).toBe(0);
                });

                it("Should save the user settings on settings close", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    testHelpers.clearRequests();
                    $mainRegion.find(".dashboardChart.workoutSummaryChart .settings").trigger("mousedown");
                    expect(testHelpers.hasRequest("PUT", "user")).toBe(false);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("PUT", "user")).toBe(true);
                });

                it("Should not request new data on settings close if parameters haven't changed", function()
                {
                    var $body = theMarsApp.getBodyElement();
                    testHelpers.clearRequests();
                    $mainRegion.find(".dashboardChart.workoutSummaryChart .settings").trigger("mousedown");
                    expect(testHelpers.hasRequest("POST", "/workoutsummary/")).toBe(false);
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                    expect(testHelpers.hasRequest("POST", "/workoutsummary/")).toBe(false);
                });

                it("Should use dates entered in settings tomahawk", function()
                {
                    var $body = theMarsApp.getBodyElement();

                    // set dashboard dates
                    applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2013-01-01", "2013-04-15");
                    testHelpers.clearRequests();

                    // set tomahawk dates
                    $mainRegion.find(".dashboardChart.workoutSummaryChart .settings").trigger("mousedown");
                    $body.find(".dashboardChartSettings .dateOptionsRegion .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                    $body.find(".dashboardChartSettings .dateOptionsRegion .dashboardDatePicker input.startDate").val("2012-04-01").trigger("change");
                    $body.find(".dashboardChartSettings .dateOptionsRegion .dashboardDatePicker input.endDate").val("2012-12-24").trigger("change");
                    $body.find(".dashboardChartSettings .closeIcon").trigger("click");

                    // should request tomahawk dates
                    expect(testHelpers.hasRequest("POST", "workoutsummary/2012-04-01/2012-12-24")).toBe(true);

                    // should not request dashboard dates
                    expect(testHelpers.hasRequest("POST", "workoutsummary/2013-01-01/2013-04-15")).toBe(false);

                });

            });

            describe("Apply dashboard dates", function()
            {

                var workoutSummaryPodSettings= {
                    index: 0,
                    chartType: 10,
                    title: "Workout Summary",
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
                    theMarsApp.user.set("settings.dashboard.pods", [workoutSummaryPodSettings]);
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
                    expect(testHelpers.hasRequest("POST", "/workoutsummary/")).toBe(true);   
                    expect(testHelpers.hasRequest("POST", "workoutsummary/2012-01-01/2016-04-15")).toBe(true);
                });

            });

        });

    });

});