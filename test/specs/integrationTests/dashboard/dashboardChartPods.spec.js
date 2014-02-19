define(
[
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "TP",
    "views/dashboard/chartUtils"
],
function(
    testHelpers,
    xhrData,
    TP, 
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
                $mainRegion = testHelpers.theApp.mainRegion.$el;
                testHelpers.theApp.router.navigate("dashboard", true);
                $body = testHelpers.theApp.getBodyElement();
            });

            afterEach(function()
            {
                testHelpers.stopTheApp();
            });

            it("Should have a global date selector", function()
            {
                $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker select.dateOptions").length).to.equal(1);
            });

            it("Should have a start and end date input", function()
            {
                $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker input.startDate").length).to.equal(1);
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker input.endDate").length).to.equal(1);
            });

            it("Should hide date inputs if not a custom date type", function()
            {
                $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
                var dateOptions = $body.find(".dashboardHeaderDatePicker .dashboardDatePicker select.dateOptions");
                dateOptions.val(chartUtils.chartDateOptions.LAST_7_DAYS.id).trigger("change");
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker .dateRanges").is(".customStartDate")).to.equal(false);
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker .dateRanges").is(".customEndDate")).to.equal(false);
            });

            it("Should display date inputs for custom date type", function()
            {
                $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
                var dateOptions = $body.find(".dashboardHeaderDatePicker .dashboardDatePicker select.dateOptions");
                dateOptions.val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker .dateRanges").is(".customStartDate")).to.equal(true);
                expect($body.find(".dashboardHeaderDatePicker .dashboardDatePicker .dateRanges").is(".customEndDate")).to.equal(true);
            });

            it("Should save settings when closing datepicker tomahawk", function()
            {
                testHelpers.clearRequests();
                $mainRegion.find("#dashboardHeader .calendarMonthLabel").trigger("click");
                expect(testHelpers.hasRequest("PUT", "settings/dashboard")).to.equal(false);
                $body.find(".dashboardHeaderDatePicker .closeIcon").trigger("click");
                expect(testHelpers.hasRequest("PUT", "settings/dashboard")).to.equal(true);
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
                    $mainRegion = testHelpers.theApp.mainRegion.$el;
                    testHelpers.theApp.router.navigate("dashboard", true);
                    $body = testHelpers.theApp.getBodyElement();
                });

                afterEach(function()
                {
                    testHelpers.stopTheApp();
                });

                it("Should should not display any dashboard charts", function()
                {
                    expect($mainRegion.find(".dashboardChart").length).to.equal(0);
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
                    var userData = _.clone(xhrData.users.barbkprem, true);
                    userData.settings.dashboard.pods = [pmcPodSettings];
                    testHelpers.startTheAppAndLogin(userData);
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
                    expect($mainRegion.find(".dashboardChart.pmcChart").length).to.equal(1);
                });

                it("Should request pmc data", function()
                {
                    console.log(_.pluck(testHelpers.fakeAjaxRequests, "url"));
                    console.log(_.pluck(testHelpers.fakeAjaxRequests, "status"));
                    expect(testHelpers.hasRequest("POST", "reporting/performancedata")).to.equal(true);
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
                            $mainRegion = testHelpers.theApp.mainRegion.$el;
                            testHelpers.theApp.router.navigate("dashboard", true);
                            //console.log(userData.settings.dashboard.pods);
                            //console.log(testHelpers.theApp.user.getDashboardSettings().get("pods"));
                            $body = testHelpers.theApp.getBodyElement();
                        });

                        afterEach(function()
                        {
                            testHelpers.stopTheApp();
                        });

                        it("Should request initial pmc data", function()
                        {
                            expect(testHelpers.hasRequest("POST", "reporting/performancedata")).to.equal(true);   
                        });

                        it("Should update when dashboard dates are updated", function()
                        {
                            testHelpers.clearRequests();
                            //console.log("Updating dashboard");
                            applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2013-01-01", "2013-04-15");
                            //console.log("Finished updating dashboard");
                            expect(testHelpers.hasRequest("POST", "reporting/performancedata")).to.equal(true);   
                            expect(testHelpers.hasRequest("POST", "reporting/performancedata/2013-01-01/2013-04-15")).to.equal(true);
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
                            $mainRegion = testHelpers.theApp.mainRegion.$el;
                            testHelpers.theApp.router.navigate("dashboard", true);
                            $body = testHelpers.theApp.getBodyElement();
                        });

                        afterEach(function()
                        {
                            testHelpers.stopTheApp();
                        });
                        

                        it("Should not update when dashboard dates are updated", function()
                        {
                            testHelpers.clearRequests();
                            applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2013-01-01", "2013-04-15");
                            expect(testHelpers.hasRequest("POST", "reporting/performancedata")).to.equal(false);   
                            expect(testHelpers.hasRequest("POST", "reporting/performancedata/2013-01-01/2013-04-15")).to.equal(false);
                        });
                    });
                });

                describe("Chart date settings", function()
                {
                    it("Should open the settings tomahawk", function()
                    {
                        var $body = testHelpers.theApp.getBodyElement();
                        expect($body.find(".dashboardChartSettings").length).to.equal(0);
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect($body.find(".dashboardChartSettings").length).to.equal(1);
                    });

                    it("Should have a date picker in the settings tomahawk", function()
                    {
                        var $body = testHelpers.theApp.getBodyElement();
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect($body.find(".dashboardChartSettings .dashboardDatePicker").length).to.equal(1);
                    });

                    it("Should close when clicking on the close icon", function()
                    {
                        var $body = testHelpers.theApp.getBodyElement();
                        expect($body.find(".dashboardChartSettings").length).to.equal(0);
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect($body.find(".dashboardChartSettings").length).to.equal(1);
                        $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                        expect($body.find(".dashboardChartSettings").length).to.equal(0);
                    });

                    it("Should save the user settings on settings close", function()
                    {
                        var $body = testHelpers.theApp.getBodyElement();
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect(testHelpers.hasRequest("PUT", "settings/dashboard")).to.equal(false);
                        $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                        expect(testHelpers.hasRequest("PUT", "settings/dashboard")).to.equal(true);
                    });

                    it("Should not request new data on settings close if parameters haven't changed", function()
                    {
                        var $body = testHelpers.theApp.getBodyElement();
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).to.equal(false);
                        $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).to.equal(false);
                    });

                    it("Should request new data on settings close if parameters have changed", function()
                    {
                        var $body = testHelpers.theApp.getBodyElement();
                        testHelpers.clearRequests();
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).to.equal(false);
                        $body.find(".dashboardChartSettings #ctlConstant").val("99").attr("value", "99").trigger("change");
                        $body.find(".dashboardChartSettings .closeIcon").trigger("click");
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata")).to.equal(true);
                    });

                    it("Should use dates entered in settings tomahawk", function()
                    {
                        var $body = testHelpers.theApp.getBodyElement();

                        // set dashboard dates
                        applyDashboardDates($mainRegion, $body, chartUtils.chartDateOptions.CUSTOM_DATES.id, "2013-01-01", "2013-04-15");
                        $mainRegion.find("#dashboardHeader .applyDates").trigger("click");                       
                        testHelpers.clearRequests();

                        // set tomahawk dates
                        $mainRegion.find(".dashboardChart.pmcChart .settings").trigger("mousedown");
                        $body.find(".dashboardChartSettings .dashboardDatePicker select.dateOptions").val(chartUtils.chartDateOptions.CUSTOM_DATES.id).trigger("change");
                        $body.find(".dashboardChartSettings .dashboardDatePicker input.startDate").val(TP.utils.datetime.format("2012-04-01")).trigger("change");
                        $body.find(".dashboardChartSettings .dashboardDatePicker input.endDate").val(TP.utils.datetime.format("2012-12-25")).trigger("change");
                        $body.find(".dashboardChartSettings .closeIcon").trigger("click");

                        // should request tomahawk dates
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata/2012-04-01/2012-12-25")).to.equal(true);

                        // should not request dashboard dates
                        expect(testHelpers.hasRequest("POST", "reporting/performancedata/2013-01-01/2013-04-15")).to.equal(false);

                    });

                });
            });

        });

    });

});
