// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "jquery",
    "moment",
    "TP",
    "app",
    "utilities/charting/chartColors",
    "dashboard/reportingDataManager",
    "dashboard/charts/pmcChart"
],
function(
    $,
    moment,
    TP,
    theMarsApp,
    chartColors,
    ReportingDataManager,
    PmcChart
    )
{

    var buildPmcModelData = function(howManyItems, future)
    {
        modelData = [];

        var multiplier = future ? 1 : -1;

        for(var i = 0;i < howManyItems;i++)
        {
            modelData.push({
                workoutDay: moment().add("days", multiplier * i).hour(0).format(TP.utils.datetime.shortDateFormat),
                tssActual: i * 10,
                tssPlanned: i * 15,
                atl: i * 5,
                ctl: i * 20,
                tsb: i - 20,
                ifPlanned: i * 0.11,
                ifActual: i * 0.11
            });
        }
  
        return modelData;
    };

    var buildPmcChart = function()
    {
        return new PmcChart({
            dateOptions: { quickDateSelectOption: null, startDate: null, endDate: null}
        }, {
            dataManager: new ReportingDataManager()
        });
    };

    describe("PMC Chart View", function()
    {

        beforeEach(function()
        {
            theMarsApp.user.setCurrentAthleteId(1);
        });
        
        it("Should load successfully as a module", function()
        {
            expect(PmcChart).toBeDefined();
        });

        it("Should set correct default settings", function()
        {
            var chart = buildPmcChart();
            expect(chart.get("atlConstant")).toBe(7);
            expect(chart.get("ctlConstant")).toBe(42);
            expect(chart.get("atlStartValue")).toBe(0);
            expect(chart.get("ctlStartValue")).toBe(0);
            expect(chart.get("workoutTypeIds").length).toBe(1);
            expect(chart.get("workoutTypeIds.0")).toBe("0");
            expect(chart.get("showIntensityFactorPerDay")).toBe(true);
            expect(chart.get("showTSBFill")).toBe(false);
            expect(chart.get("showTSSPerDay")).toBe(true);
        });

        describe("Data parsing", function()
        {

            describe("Past and present days", function()
            {
                describe("TSS", function()
                {
                    var chartPoints, chart, modelData;
                    beforeEach(function()
                    {
                        modelData = buildPmcModelData(10);
                        chart = buildPmcChart(); 
                        chartPoints = chart.buildFlotPoints(modelData);
                    });

                    it("Should return TSS data in the flot points", function()
                    {
                        expect(chartPoints.TSS).toBeDefined();
                        expect(chartPoints.TSS.length).toEqual(modelData.length);
                    });

                    it("Should put the correct values in the TSS points", function()
                    {
                        _.each(chartPoints.TSS, function(chartPoint, index)
                        {
                            expect(Number(chartPoint[1])).toEqual(index * 10);
                        });
                    });

                    it("Should include a date for each TSS point", function()
                    {
                        expect(
                            moment(chartPoints.TSS[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.TSS[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().subtract("days", 9).format(TP.utils.datetime.shortDateFormat)
                        );
                    });
                });

                describe("ATL", function()
                {
                    var chartPoints, chart, modelData;
                    beforeEach(function()
                    {
                        modelData = buildPmcModelData(10);
                        chart = buildPmcChart();
                        chartPoints = chart.buildFlotPoints(modelData);
                    });

                    it("Should return ATL data in the flot points", function()
                    {
                        expect(chartPoints.ATL).toBeDefined();
                        expect(chartPoints.ATL.length).toEqual(modelData.length);
                    });

                    it("Should put the correct values in the ATL points", function()
                    {
                        _.each(chartPoints.ATL, function(chartPoint, index)
                        {
                            expect(chartPoint[1]).toEqual(index * 5);
                        });
                    });

                    it("Should include a date for each ATL point", function()
                    {
                        expect(
                            moment(chartPoints.ATL[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.ATL[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().subtract("days", 9).format(TP.utils.datetime.shortDateFormat)
                        );
                    });
                });

                describe("IF", function()
                {
                    var chartPoints, chart, modelData;
                    beforeEach(function()
                    {
                        modelData = buildPmcModelData(10);
                        chart = buildPmcChart();
                        chartPoints = chart.buildFlotPoints(modelData);
                    });

                    it("Should return IF data in the flot points", function()
                    {
                        expect(chartPoints.IF).toBeDefined();
                        expect(chartPoints.IF.length).toEqual(modelData.length);
                    });

                    it("Should put the correct values in the IF points", function()
                    {
                        _.each(chartPoints.IF, function(chartPoint, index)
                        {
                            expect(chartPoint[1]).toEqual(index * 0.11);
                        });
                    });

                    it("Should include a date for each IF point", function()
                    {
                        expect(
                            moment(chartPoints.IF[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.IF[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().subtract("days", 9).format(TP.utils.datetime.shortDateFormat)
                        );
                    });
                });

                describe("CTL", function()
                {
                    var chartPoints, chart, modelData;
                    beforeEach(function()
                    {
                        modelData = buildPmcModelData(10);
                        chart = buildPmcChart();
                        chartPoints = chart.buildFlotPoints(modelData);
                    });

                    it("Should return CTL data in the flot points", function()
                    {
                        expect(chartPoints.CTL).toBeDefined();
                        expect(chartPoints.CTL.length).toEqual(modelData.length);
                    });

                    it("Should put the correct values in the CTL points", function()
                    {
                        _.each(chartPoints.CTL, function(chartPoint, index)
                        {
                            expect(chartPoint[1]).toEqual(index * 20);
                        });
                    });

                    it("Should include a date for each CTL point", function()
                    {
                        expect(
                            moment(chartPoints.CTL[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.CTL[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().subtract("days", 9).format(TP.utils.datetime.shortDateFormat)
                        );
                    });
                });


                describe("TSB", function()
                {
                    var chartPoints, chart, modelData;
                    beforeEach(function()
                    {
                        modelData = buildPmcModelData(10);
                        chart = buildPmcChart();
                        chartPoints = chart.buildFlotPoints(modelData);
                    });

                    it("Should return TSB data in the flot points", function()
                    {
                        expect(chartPoints.TSB).toBeDefined();
                        expect(chartPoints.TSB.length).toEqual(modelData.length);
                    });

                    it("Should put the correct values in the TSB points", function()
                    {
                        _.each(chartPoints.TSB, function(chartPoint, index)
                        {
                            expect(chartPoint[1]).toEqual(index - 20);
                        });
                    });

                    it("Should include a date for each TSB point", function()
                    {
                        expect(
                            moment(chartPoints.TSB[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.TSB[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().subtract("days", 9).format(TP.utils.datetime.shortDateFormat)
                        );
                    });
                });
            });

            describe("Future days", function()
            {
                describe("TSSFuture", function()
                {
                    var chartPoints, chart, modelData;
                    beforeEach(function()
                    {
                        modelData = buildPmcModelData(10, true);
                        chart = buildPmcChart();
                        chartPoints = chart.buildFlotPoints(modelData);
                    });

                    it("Should return TSS data in the flot points", function()
                    {
                        expect(chartPoints.TSS).toBeDefined();
                        expect(chartPoints.TSSFuture).toBeDefined();
                        expect(chartPoints.TSS.length).toEqual(modelData.length);
                        expect(chartPoints.TSSFuture.length).toEqual(modelData.length);
                    });

                    it("Should not put today's TSS value in both past and future", function()
                    {
                        expect(chartPoints.TSS[0][1]).toEqual(0);
                        expect(chartPoints.TSSFuture[0][1]).toEqual(null);
                    });

                    it("Should put future TSS value only in future", function()
                    {
                        expect(chartPoints.TSS[9][1]).toEqual(null);
                        expect(chartPoints.TSSFuture[9][1]).toEqual(135);
                    });

                    it("Should include a date for each TSS point", function()
                    {
                        expect(
                            moment(chartPoints.TSSFuture[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.TSSFuture[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().add("days", 9).format(TP.utils.datetime.shortDateFormat)
                        );
                    });
                });

                describe("TSBFuture", function()
                {
                    var chartPoints, chart, modelData;
                    beforeEach(function()
                    {
                        modelData = buildPmcModelData(10, true);
                        chart = buildPmcChart();
                        chartPoints = chart.buildFlotPoints(modelData);
                    });

                    it("Should return TSB data in the flot points", function()
                    {
                        expect(chartPoints.TSB).toBeDefined();
                        expect(chartPoints.TSBFuture).toBeDefined();
                        expect(chartPoints.TSB.length).toEqual(modelData.length);
                        expect(chartPoints.TSBFuture.length).toEqual(modelData.length);
                    });

                    it("Should put today's TSB value in both past and future", function()
                    {
                        expect(chartPoints.TSB[0][1]).toEqual(-20);
                        expect(chartPoints.TSBFuture[0][1]).toEqual(-20);
                    });

                    it("Should put future TSB value only in future", function()
                    {
                        expect(chartPoints.TSB[9][1]).toEqual(null);
                        expect(chartPoints.TSBFuture[9][1]).toEqual(-11);
                    });

                    it("Should include a date for each TSB point", function()
                    {
                        expect(
                            moment(chartPoints.TSBFuture[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.TSBFuture[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().add("days", 9).format(TP.utils.datetime.shortDateFormat)
                        );
                    });
                });

                describe("ATLFuture", function()
                {
                    var chartPoints, chart, modelData;
                    beforeEach(function()
                    {
                        modelData = buildPmcModelData(10, true);
                        chart = buildPmcChart();
                        chartPoints = chart.buildFlotPoints(modelData);
                    });

                    it("Should return ATL data in the flot points", function()
                    {
                        expect(chartPoints.ATL).toBeDefined();
                        expect(chartPoints.ATLFuture).toBeDefined();
                        expect(chartPoints.ATL.length).toEqual(modelData.length);
                        expect(chartPoints.ATLFuture.length).toEqual(modelData.length);
                    });

                    it("Should put today's ATL value in both past and future", function()
                    {
                        expect(chartPoints.ATL[0][1]).toEqual(0);
                        expect(chartPoints.ATLFuture[0][1]).toEqual(0);
                    });

                    it("Should put future ATL value only in future", function()
                    {
                        expect(chartPoints.ATL[9][1]).toEqual(null);
                        expect(chartPoints.ATLFuture[9][1]).toEqual(45);
                    });

                    it("Should include a date for each ATL point", function()
                    {
                        expect(
                            moment(chartPoints.ATLFuture[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.ATLFuture[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().add("days", 9).format(TP.utils.datetime.shortDateFormat)
                        );
                    });
                });

                describe("IFFuture", function()
                {
                    var chartPoints, chart, modelData;
                    beforeEach(function()
                    {
                        modelData = buildPmcModelData(10, true);
                        chart = buildPmcChart();
                        chartPoints = chart.buildFlotPoints(modelData);
                    });

                    it("Should return IF data in the flot points", function()
                    {
                        expect(chartPoints.IF).toBeDefined();
                        expect(chartPoints.IFFuture).toBeDefined();
                        expect(chartPoints.IF.length).toEqual(modelData.length);
                        expect(chartPoints.IFFuture.length).toEqual(modelData.length);
                    });

                    it("Should not put today's IF value in both past and future", function()
                    {
                        expect(chartPoints.IF[0][1]).toEqual(0);
                        expect(chartPoints.IFFuture[0][1]).toEqual(null);
                    });

                    it("Should put future IF value only in future", function()
                    {
                        expect(chartPoints.IF[9][1]).toEqual(null);
                        expect(chartPoints.IFFuture[9][1]).toEqual(9 * 0.11);
                    });

                    it("Should include a date for each IF point", function()
                    {
                        expect(
                            moment(chartPoints.IFFuture[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.IFFuture[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().add("days", 9).format(TP.utils.datetime.shortDateFormat)
                        );
                    });
                });
                describe("CTLFuture", function()
                {
                    var chartPoints, chart, modelData;
                    beforeEach(function()
                    {
                        modelData = buildPmcModelData(10, true);
                        chart = buildPmcChart();
                        chartPoints = chart.buildFlotPoints(modelData);
                    });

                    it("Should return CTL data in the flot points", function()
                    {
                        expect(chartPoints.CTL).toBeDefined();
                        expect(chartPoints.CTLFuture).toBeDefined();
                        expect(chartPoints.CTL.length).toEqual(modelData.length);
                        expect(chartPoints.CTLFuture.length).toEqual(modelData.length);
                    });

                    it("Should put today's CTL value in both past and future", function()
                    {
                        expect(chartPoints.CTL[0][1]).toEqual(0);
                        expect(chartPoints.CTLFuture[0][1]).toEqual(0);
                    });

                    it("Should put future CTL value only in future", function()
                    {
                        expect(chartPoints.CTL[9][1]).toEqual(null);
                        expect(chartPoints.CTLFuture[9][1]).toEqual(180);
                    });

                    it("Should include a date for each CTL point", function()
                    {
                        expect(
                            moment(chartPoints.CTLFuture[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.CTLFuture[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).toEqual(
                            moment().add("days", 9).format(TP.utils.datetime.shortDateFormat)
                        );
                    });
                });
            });
        });

        describe("Build flot data series", function()
        {
            var chartSeries;

            beforeEach(function()
            {
                var modelData = buildPmcModelData(10);
                var chart = buildPmcChart();
                spyOn(chart, "shouldShowTSS").andReturn(true);
                spyOn(chart, "shouldShowIF").andReturn(true);
                spyOn(chart, "shouldShowTSBFill").andReturn(true);
                var chartPoints = chart.buildFlotPoints(modelData);
                chartSeries = chart.buildFlotDataSeries(chartPoints, chartColors);
            });

            // because we need an extra series for IF future fill and ATL future fill
            it("Should contain eleven items (five past, seven future)", function()
            {
                expect(chartSeries.length).toBe(12);
            });
        });

        describe("Chart title workout types", function()
        {

            it("Should say 'PMC - Workout Type: All' if no workout types are set", function()
            {
                expect(TP.utils.workout.types.getListOfNames([0], "All")).toEqual("All");
            });

            it("Should include workout types if set", function()
            {
                expect(TP.utils.workout.types.getListOfNames([1, 2, 3])).toEqual("Swim, Bike, Run");
            });

        });

        describe("Click on a data point", function()
        {
            var modelData = buildPmcModelData(10);
            var chart = buildPmcChart();
            chart.rawData = modelData;
            spyOn(chart.dataManager, "fetchOnModel").andReturn(new $.Deferred().resolve());
            var tomahawkView = chart.createItemDetailView(null, {pageX: 10, pageY: 10}, {dataIndex: 2});

            it("Should instantiate a PmcWorkoutsListView", function()
            {
                expect(tomahawkView).toBeDefined();
            });

        });

    });

});
