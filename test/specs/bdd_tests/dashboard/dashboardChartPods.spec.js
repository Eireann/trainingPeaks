// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "TP",
    "app",
    "views/dashboard/chartUtils"
],
function(
    testHelpers,
    xhrData,
    TP, 
    theMarsApp,
    chartUtils
    )
{

    var applyDashboardDates = function($mainRegion, $body, dateOptionId, startDate, endDate)
    {
        startDate = TP.utils.datetime.format(startDate);
        endDate = TP.utils.datetime.format(endDate);
        //console.log("Applying dashboard dates: " + dateOptionId + ", " + startDate + " - " + endDate);
        $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
        $body.find(".dashboardHeaderDatePicker .dashboardDatePicker select.dateOptions").val(dateOptionId).trigger("change");
        $body.find(".dashboardHeaderDatePicker .dashboardDatePicker input.startDate").val(startDate).trigger("change");
        $body.find(".dashboardHeaderDatePicker .dashboardDatePicker input.endDate").val(endDate).trigger("change");
        $body.find(".dashboardHeaderDatePicker .closeIcon").trigger("click");
    };

    describe("Dashboard Chart Container", function()
    {
        var $mainRegion;
        var $body;

        describe("Date selector", function()
        {

            beforeEach(function()
            {
                var userData = xhrData.users.barbkprem;
                testHelpers.startTheAppAndLogin(userData);
                $mainRegion = theMarsApp.mainRegion.$el;
                theMarsApp.router.navigate("dashboard", true);
                $body = theMarsApp.getBodyElement();
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should have a global date selector", function()
            {
                $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker select.dateOptions").length).toBe(1);
            });

            it("Should have a start and end date input", function()
            {
                $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker input.startDate").length).toBe(1);
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker input.endDate").length).toBe(1);
            });

            it("Should hide date inputs if not a custom date type", function()
            {
                $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
                var dateOptions = $body.find(".dashboardHeaderDatePicker .dashboardDatePicker select.dateOptions");
                dateOptions.val(chartUtils.chartDateOptions.LAST_7_DAYS.id).trigger("change");
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker .dateRanges").is(".customStartDate")).toBe(false);
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker .dateRanges").is(".customEndDate")).toBe(false);
            });

            it("Should display date inputs for custom date type", function()
            {
                $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
                var dateOptions = $body.find(".dashboardHeaderDatePicker .dashboardDatePicker select.dateOptions");
                dateOptions.val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker .dateRanges").is(".customStartDate")).toBe(true);
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker .dateRanges").is(".customEndDate")).toBe(true);
            });

            it("Should save settings when closing datepicker tomahawk", function()
            {
                testHelpers.clearRequests();
                $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
                expect(testHelpers.hasRequest("PUT", "settings/dashboard")).toBe(false);
                $body.find(".dashboardHeaderDatePicker .closeIcon").trigger("click");
                expect(testHelpers.hasRequest("PUT", "settings/dashboard")).toBe(true);
            });

        });

        describe("Pods", function()
        {

            describe("User has no pods", function()
            {
                beforeEach(function()
                {
                    var userData = xhrData.users.barbkprem;
                    testHelpers.startTheAppAndLogin(userData);
                    $mainRegion = theMarsApp.mainRegion.$el;
                    theMarsApp.router.navigate("dashboard", true);
                    $body = theMarsApp.getBodyElement();
                });

                afterEach(function()
                {
                    testHelpers.stopTheApp();
                });

                it("Should should not display any dashboard charts", function()
                {
                    expect($mainRegion.find(".dashboardChart").length).toBe(0);
                });
            });

            describe("Pmc pod", function()
            {

                var pmcPodSettings = {
                    index: 0,
                    chartType: 32,
                    title: "PMC"
                };

                beforeEach(function()
                {
                    var userData = xhrData.users.barbkprem;
                    userData.settings.dashboard.pods = [pmcPodSettings];
                    testHelpers.startTheAppAndLogin(userData);
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
                    expect($mainRegion.find(".dashboardChart.pmcChart").length).toBe(1);
                });

                it("Should request pmc data", function()
                {
                    /*
                    reporting/performancedata
                    var urlExtension = "/" + start + "/" + end + "/" + workoutTypes + "/" + this.ctlConstant + "/" + this.ctlStartValue + "/" + this.atlConstant + "/" + this.atlStartValue;
                    */
                    expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(true);
                });


                describe("Date ranges", function()
                {
                    describe("Using dashboard dates", function()
                    {
                        var pmcPodSettings = {
                            index: 0,
                            chartType: 32,
                            title: "PMC",
                            dateOptions: {
                                quickDateSelectOption: chartUtils.chartDateOptions.USE_GLOBAL_DATES.id,
                                startDate: null,
                                endDate: null
                            }
                        };

                        beforeEach(function()
                        {
                            var userData = xhrData.users.barbkprem;
                            userData.settings.dashboard.pods = [pmcPodSettings];
                            testHelpers.startTheAppAndLogin(userData);
                            $mainRegion = theMarsApp.mainRegion.$el;
                            theMarsApp.router.navigate("dashboard", true);
                            //console.log(userData.settings.dashboard.pods);
                            //console.log(theMarsApp.user.getDashboardSettings().get("pods"));
                            $body = theMarsApp.getBodyElement();
                        });

                        afterEach(function()
                        {
                            testHelpers.stopTheApp();
                        });

                        it("Should request initial pmc data", function()
                        {
                            expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(true);   
                        });

                        it("Should update when dashboard dates are updated", function()
                        {
                            testHelpers.clearRequests();
                            //console.log("Updating dashboard");
                            applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2013-01-01", "2013-04-15");
                            //console.log("Finished updating dashboard");
                            console.log(testHelpers.fakeAjaxRequests); 
                            expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(true);   
                            expect(testHelpers.hasRequest("POST", "reporting/performancedata/2013-01-01/2013-04-15")).toBe(true);
                        });

                    });

                    describe("Using custom dates", function()
                    {
                        var pmcPodSettings = {
                            index: 0,
                            chartType: 32,
                            title: "PMC",
                            dateOptions: {
                                quickDateSelectOption: chartUtils.chartDateOptions.LAST_14_DAYS.id,
                                startDate: null,
                                endDate: null
                            }
                        };

                        beforeEach(function()
                        {
                            var userData = xhrData.users.barbkprem;
                            userData.settings.dashboard.pods = [pmcPodSettings];
                            testHelpers.startTheAppAndLogin(userData);
                            $mainRegion = theMarsApp.mainRegion.$el;
                            theMarsApp.router.navigate("dashboard", true);
                            $body = theMarsApp.getBodyElement();
                        });

                        afterEach(function()
                        {
                            testHelpers.stopTheApp();
                        });
                        

                        it("Should not update when dashboard dates are updated", function()
                        {
                            testHelpers.clearRequests();
                            applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2013-01-01", "2013-04-15");
                            expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(false);   
                            expect(testHelpers.hasRequest("POST", "reporting/performancedata/2013-01-01/2013-04-15")).toBe(false);
                        });
                    });
                });

                describe("Chart date settings", function()
                {
                    it("Should open the settings tomahawk", function()
                    {
                        var $body = theMarsApp.getBodyElement();
                        expect($body.find(".dashboardChartSettings").length).toBe(0);
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect($body.find(".dashboardChartSettings").length).toBe(1);
                    });

                    it("Should have a date picker in the settings tomahawk", function()
                    {
                        var $body = theMarsApp.getBodyElement();
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect($body.find(".dashboardChartSettings .dashboardDatePicker").length).toBe(1);
                    });

                    it("Should close when clicking on the close icon", function()
                    {
                        var $body = theMarsApp.getBodyElement();
                        expect($body.find(".dashboardChartSettings").length).toBe(0);
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect($body.find(".dashboardChartSettings").length).toBe(1);
                        $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                        expect($body.find(".dashboardChartSettings").length).toBe(0);
                    });

                    it("Should save the user settings on settings close", function()
                    {
                        var $body = theMarsApp.getBodyElement();
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect(testHelpers.hasRequest("PUT", "settings/dashboard")).toBe(false);
                        $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                        expect(testHelpers.hasRequest("PUT", "settings/dashboard")).toBe(true);
                    });

                    it("Should not request new data on settings close if parameters haven't changed", function()
                    {
                        var $body = theMarsApp.getBodyElement();
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(false);
                        $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(false);
                    });

                    it("Should request new data on settings close if parameters have changed", function()
                    {
                        var $body = theMarsApp.getBodyElement();
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(false);
                        $body.find(".dashboardChartSettings #ctlConstant").val("99").attr("value", "99").trigger("change");
                        $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(true);
                    });

                    it("Should use dates entered in settings tomahawk", function()
                    {
                        var $body = theMarsApp.getBodyElement();

                        // set dashboard dates
                        applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2013-01-01", "2013-04-15");
                        $mainRegion.find("#dashboardHeader .applyDates").trigger("click");                       
                        testHelpers.clearRequests();

                        // set tomahawk dates
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        $body.find(".dashboardChartSettings .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                        $body.find(".dashboardChartSettings .dashboardDatePicker input.startDate").val("2012-04-01").trigger("change");
                        $body.find(".dashboardChartSettings .dashboardDatePicker input.endDate").val("2012-12-25").trigger("change");
                        $body.find(".dashboardChartSettings .closeIcon").trigger("click");

                        // should request tomahawk dates
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata/2012-04-01/2012-12-25")).toBe(true);

                        // should not request dashboard dates
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata/2013-01-01/2013-04-15")).toBe(false);

                    });

                });
            });

        });

    });

});
