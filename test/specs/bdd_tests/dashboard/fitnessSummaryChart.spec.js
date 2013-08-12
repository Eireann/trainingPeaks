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

    describe("Fitness Summary Chart", function()
    {
        var $mainRegion;

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
                    userData.settings.dashboard.pods = [fitnessSummaryPodSettings];
                    testHelpers.startTheAppAndLogin(userData);
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
                    expect($mainRegion.find(".dashboardChart.fitnessSummaryChart").length).toBe(1);
                });

                it("Should request fitness summary data", function()
                {
                    expect(testHelpers.hasRequest(null, "reporting/fitnesssummary")).toBe(true);
                });


                describe("Date ranges", function()
                {
                    it("Should update when dashboard dates are updated, if it is set to use dashboard dates", function()
                    {
                        testHelpers.clearRequests();
                        theMarsApp.user.set("settings.dashboard.pods.0.dateOptions.quickDateSelectOption", chartUtils.chartDateOptions.USE_GLOBAL_DATES.id);
                        $mainRegion.find("#dashboardHeader .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                        $mainRegion.find("#dashboardHeader .dashboardDatePicker input.startDate").val("2013-01-01").trigger("change");
                        $mainRegion.find("#dashboardHeader .dashboardDatePicker input.endDate").val("2013-04-15").trigger("change");
                        $mainRegion.find("#dashboardHeader .applyDates").trigger("click");                       
                        expect(testHelpers.hasRequest(null, "reporting/fitnesssummary")).toBe(true);   
                        expect(testHelpers.hasRequest(null, "reporting/fitnesssummary/2013-01-01/2013-04-15")).toBe(true);
                    });

                    it("Should not update when dashboard dates are updated, if it is not set to use dashboard dates", function()
                    {
                        testHelpers.clearRequests();
                        theMarsApp.user.set("settings.dashboard.pods.0.dateOptions.quickDateSelectOption", chartUtils.chartDateOptions.LAST_14_DAYS.id);
                        $mainRegion.find("#dashboardHeader .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                        $mainRegion.find("#dashboardHeader .dashboardDatePicker input.startDate").val("2013-01-01").trigger("change");
                        $mainRegion.find("#dashboardHeader .dashboardDatePicker input.endDate").val("2013-04-15").trigger("change");
                        $mainRegion.find("#dashboardHeader .applyDates").trigger("click");                       
                        expect(testHelpers.hasRequest(null, "reporting/fitnesssummary")).toBe(false);   
                        expect(testHelpers.hasRequest(null, "reporting/fitnesssummary/2013-01-01/2013-04-15")).toBe(false);
                    });
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
                        $body.find(".dashboardChartSettings #closeIcon").trigger("click");
                        expect($body.find(".dashboardChartSettings").length).toBe(0);
                    });

                    it("Should save the user settings on settings close", function()
                    {
                        var $body = theMarsApp.getBodyElement();
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                        expect(testHelpers.hasRequest(null, "user")).toBe(false);
                        $body.find(".dashboardChartSettings #closeIcon").trigger("click");
                        expect(testHelpers.hasRequest(null, "user")).toBe(true);
                    });

                    it("Should not request new data on settings close if parameters haven't changed", function()
                    {
                        var $body = theMarsApp.getBodyElement();
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                        expect(testHelpers.hasRequest(null, "reporting/fitnesssummary")).toBe(false);
                        $body.find(".dashboardChartSettings #closeIcon").trigger("click");
                        expect(testHelpers.hasRequest(null, "reporting/fitnesssummary")).toBe(false);
                    });

                    it("Should use dates entered in settings tomahawk", function()
                    {
                        var $body = theMarsApp.getBodyElement();

                        // set dashboard dates
                        $mainRegion.find("#dashboardHeader .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                        $mainRegion.find("#dashboardHeader .dashboardDatePicker input.startDate").val("2013-01-01").trigger("change");
                        $mainRegion.find("#dashboardHeader .dashboardDatePicker input.endDate").val("2013-04-15").trigger("change");
                        $mainRegion.find("#dashboardHeader .applyDates").trigger("click");                       
                        testHelpers.clearRequests();

                        // set tomahawk dates
                        $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                        $body.find(".dashboardChartSettings .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                        $body.find(".dashboardChartSettings .dashboardDatePicker input.startDate").val("2012-04-01").trigger("change");
                        $body.find(".dashboardChartSettings .dashboardDatePicker input.endDate").val("2012-12-24").trigger("change");
                        $body.find(".dashboardChartSettings #closeIcon").trigger("click");

                        // should request tomahawk dates
                        expect(testHelpers.hasRequest(null, "reporting/fitnesssummary/2012-04-01/2012-12-24")).toBe(true);

                        // should not request dashboard dates
                        expect(testHelpers.hasRequest(null, "reporting/fitnesssummary/2013-01-01/2013-04-15")).toBe(false);

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
                            $body.find(".dashboardChartSettings #closeIcon").trigger("click");
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
                        $body.find(".dashboardChartSettings #closeIcon").trigger("click");
                        $mainRegion.find(".dashboardChart.fitnessSummaryChart .settings").trigger("mousedown");
                        expect($body.find(".dashboardChartSettings select.summaryType").val()).toEqual("3");
                    });
                });

            });

            xdescribe("Reporting Data Manager", function()
            {

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
                    userData.settings.dashboard.pods = [fitnessSummaryPodSettings, fitnessSummaryPodSettingsTwo];
                    testHelpers.startTheAppAndLogin(userData);
                    theMarsApp.user.on("change", function(){console.log("User changed");});
                    $mainRegion = theMarsApp.mainRegion.$el;
                    theMarsApp.router.navigate("dashboard", true);
                });

                afterEach(function()
                {
                    testHelpers.stopTheApp();
                });

                it("Should share data across multiple charts if they use the same data", function()
                {
                    var fitnessSummaryRequests = testHelpers.findAllRequests(null, "reporting/fitnesssummary");
                    expect(fitnessSummaryRequests.length).toBe(1);
                    console.log("resolved:");
                    console.log(theMarsApp.dataManagers.reporting.resolvedRequests);
                    console.log("pending:");
                    console.log(theMarsApp.dataManagers.reporting.pendingRequests);
                    console.log("Date options:");
                    console.log(theMarsApp.user.get("settings.dashboard.dateOptions"));
                });

            });
    });

});