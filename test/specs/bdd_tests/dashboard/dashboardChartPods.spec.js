// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app",
    "views/dashboard/chartUtils"
],
function(
    testHelpers,
    xhrData,
    theMarsApp,
    chartUtils
    )
{

    describe("Dashboard Chart Container", function()
    {
        var $mainRegion;

        describe("Date selector", function()
        {

            beforeEach(function()
            {
                var userData = xhrData.users.barbkprem;
                testHelpers.startTheAppAndLogin(userData);
                $mainRegion = theMarsApp.mainRegion.$el;
                theMarsApp.router.navigate("dashboard", true);
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should have a global date selector", function()
            {
                expect($mainRegion.find("#dashboardHeader .dashboardDatePicker select.dateOptions").length).toBe(1);
            });

            it("Should have a start and end date input", function()
            {
                expect($mainRegion.find("#dashboardHeader .dashboardDatePicker input.startDate").length).toBe(1);
                expect($mainRegion.find("#dashboardHeader .dashboardDatePicker input.endDate").length).toBe(1);
            });

            it("Should hide date inputs if not a custom date type", function()
            {
                var dateOptions = $mainRegion.find("#dashboardHeader .dashboardDatePicker select.dateOptions");
                dateOptions.val(chartUtils.chartDateOptions.LAST_7_DAYS.id).trigger("change");
                expect($mainRegion.find("#dashboardHeader .dashboardDatePicker .dateRanges").is(".customStartDate")).toBe(false);
                expect($mainRegion.find("#dashboardHeader .dashboardDatePicker .dateRanges").is(".customEndDate")).toBe(false);
            });

            it("Should display date inputs for custom date type", function()
            {
                var dateOptions = $mainRegion.find("#dashboardHeader .dashboardDatePicker select.dateOptions");
                dateOptions.val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                expect($mainRegion.find("#dashboardHeader .dashboardDatePicker .dateRanges").is(".customStartDate")).toBe(true);
                expect($mainRegion.find("#dashboardHeader .dashboardDatePicker .dateRanges").is(".customEndDate")).toBe(true);
            });

            it("Should save settings when clicking on apply", function()
            {
                testHelpers.clearRequests();
                expect(testHelpers.hasRequest("PUT", "user")).toBe(false);
                $mainRegion.find("#dashboardHeader .applyDates").trigger("click");
                expect(testHelpers.hasRequest("PUT", "user")).toBe(true);
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
                        });

                        afterEach(function()
                        {
                            testHelpers.stopTheApp();
                        });


                        it("Should update when dashboard dates are updated", function()
                        {
                            testHelpers.clearRequests();
                            $mainRegion.find("#dashboardHeader .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                            $mainRegion.find("#dashboardHeader .dashboardDatePicker input.startDate").val("2013-01-01").trigger("change");
                            $mainRegion.find("#dashboardHeader .dashboardDatePicker input.endDate").val("2013-04-15").trigger("change");
                            $mainRegion.find("#dashboardHeader .applyDates").trigger("click");                       
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
                        });

                        afterEach(function()
                        {
                            testHelpers.stopTheApp();
                        });
                        

                        it("Should not update when dashboard dates are updated", function()
                        {
                            testHelpers.clearRequests();
                            $mainRegion.find("#dashboardHeader .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                            $mainRegion.find("#dashboardHeader .dashboardDatePicker input.startDate").val("2013-01-01").trigger("change");
                            $mainRegion.find("#dashboardHeader .dashboardDatePicker input.endDate").val("2013-04-15").trigger("change");
                            $mainRegion.find("#dashboardHeader .applyDates").trigger("click");                       
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
                        $body.find(".dashboardChartSettings #closeIcon").trigger("click");
                        expect($body.find(".dashboardChartSettings").length).toBe(0);
                    });

                    it("Should save the user settings on settings close", function()
                    {
                        var $body = theMarsApp.getBodyElement();
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect(testHelpers.hasRequest("PUT", "user")).toBe(false);
                        $body.find(".dashboardChartSettings #closeIcon").trigger("click");
                        expect(testHelpers.hasRequest("PUT", "user")).toBe(true);
                    });

                    it("Should not request new data on settings close if parameters haven't changed", function()
                    {
                        var $body = theMarsApp.getBodyElement();
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(false);
                        $body.find(".dashboardChartSettings #closeIcon").trigger("click");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(false);
                    });

                    it("Should request new data on settings close if parameters have changed", function()
                    {
                        var $body = theMarsApp.getBodyElement();
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(false);
                        $body.find(".dashboardChartSettings #ctlConstant").val("99").attr("value", "99").trigger("change");
                        $body.find(".dashboardChartSettings #closeIcon").trigger("click");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).toBe(true);
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
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        $body.find(".dashboardChartSettings .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                        $body.find(".dashboardChartSettings .dashboardDatePicker input.startDate").val("2012-04-01").trigger("change");
                        $body.find(".dashboardChartSettings .dashboardDatePicker input.endDate").val("2012-12-25").trigger("change");
                        $body.find(".dashboardChartSettings #closeIcon").trigger("click");

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
