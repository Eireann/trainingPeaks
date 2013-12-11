define(
[
    "jquery",
    "moment",
    "TP",
    "testUtils/testHelpers",
    "utilities/charting/chartColors",
    "framework/dataManager",
    "dashboard/charts/pmcChart",
    "shared/managers/calendarManager"
],
function(
    $,
    moment,
    TP,
    testHelpers,
    chartColors,
    DataManager,
    PmcChart,
    CalendarManager
)
{

    var buildPmcModelData = function(howManyItems, future)
    {
        var modelData = [];

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
            dataManager: new DataManager()
        });
    };

    describe("PMC Chart View", function()
    {

        beforeEach(function()
        {
            testHelpers.theApp.user.setCurrentAthlete(1, new TP.Model());
        });
        
        it("Should load successfully as a module", function()
        {
            expect(PmcChart).to.not.be.undefined;
        });

        it("Should set correct default settings", function()
        {
            var chart = buildPmcChart();
            expect(chart.get("atlConstant")).to.equal(7);
            expect(chart.get("ctlConstant")).to.equal(42);
            expect(chart.get("atlStartValue")).to.equal(0);
            expect(chart.get("ctlStartValue")).to.equal(0);
            expect(chart.get("workoutTypeIds").length).to.equal(1);
            expect(chart.get("workoutTypeIds.0")).to.equal("0");
            expect(chart.get("showIntensityFactorPerDay")).to.equal(true);
            expect(chart.get("showTSBFill")).to.equal(false);
            expect(chart.get("showTSSPerDay")).to.equal(true);
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
                        expect(chartPoints.TSS).to.not.be.undefined;
                        expect(chartPoints.TSS.length).to.eql(modelData.length);
                    });

                    it("Should put the correct values in the TSS points", function()
                    {
                        _.each(chartPoints.TSS, function(chartPoint, index)
                        {
                            expect(Number(chartPoint[1])).to.eql(index * 10);
                        });
                    });

                    it("Should include a date for each TSS point", function()
                    {
                        expect(
                            moment(chartPoints.TSS[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.TSS[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
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
                        expect(chartPoints.ATL).to.not.be.undefined;
                        expect(chartPoints.ATL.length).to.eql(modelData.length);
                    });

                    it("Should put the correct values in the ATL points", function()
                    {
                        _.each(chartPoints.ATL, function(chartPoint, index)
                        {
                            expect(chartPoint[1]).to.eql(index * 5);
                        });
                    });

                    it("Should include a date for each ATL point", function()
                    {
                        expect(
                            moment(chartPoints.ATL[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.ATL[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
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
                        expect(chartPoints.IF).to.not.be.undefined;
                        expect(chartPoints.IF.length).to.eql(modelData.length);
                    });

                    it("Should put the correct values in the IF points", function()
                    {
                        _.each(chartPoints.IF, function(chartPoint, index)
                        {
                            expect(chartPoint[1]).to.eql(index * 0.11);
                        });
                    });

                    it("Should include a date for each IF point", function()
                    {
                        expect(
                            moment(chartPoints.IF[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.IF[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
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
                        expect(chartPoints.CTL).to.not.be.undefined;
                        expect(chartPoints.CTL.length).to.eql(modelData.length);
                    });

                    it("Should put the correct values in the CTL points", function()
                    {
                        _.each(chartPoints.CTL, function(chartPoint, index)
                        {
                            expect(chartPoint[1]).to.eql(index * 20);
                        });
                    });

                    it("Should include a date for each CTL point", function()
                    {
                        expect(
                            moment(chartPoints.CTL[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.CTL[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
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
                        expect(chartPoints.TSB).to.not.be.undefined;
                        expect(chartPoints.TSB.length).to.eql(modelData.length);
                    });

                    it("Should put the correct values in the TSB points", function()
                    {
                        _.each(chartPoints.TSB, function(chartPoint, index)
                        {
                            expect(chartPoint[1]).to.eql(index - 20);
                        });
                    });

                    it("Should include a date for each TSB point", function()
                    {
                        expect(
                            moment(chartPoints.TSB[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.TSB[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
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
                        expect(chartPoints.TSS).to.not.be.undefined;
                        expect(chartPoints.TSSFuture).to.not.be.undefined;
                        expect(chartPoints.TSS.length).to.eql(modelData.length);
                        expect(chartPoints.TSSFuture.length).to.eql(modelData.length);
                    });

                    it("Should not put today's TSS value in both past and future", function()
                    {
                        expect(chartPoints.TSS[0][1]).to.eql(0);
                        expect(chartPoints.TSSFuture[0][1]).to.eql(null);
                    });

                    it("Should put future TSS value only in future", function()
                    {
                        expect(chartPoints.TSS[9][1]).to.eql(null);
                        expect(chartPoints.TSSFuture[9][1]).to.eql(135);
                    });

                    it("Should include a date for each TSS point", function()
                    {
                        expect(
                            moment(chartPoints.TSSFuture[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.TSSFuture[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
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
                        expect(chartPoints.TSB).to.not.be.undefined;
                        expect(chartPoints.TSBFuture).to.not.be.undefined;
                        expect(chartPoints.TSB.length).to.eql(modelData.length);
                        expect(chartPoints.TSBFuture.length).to.eql(modelData.length);
                    });

                    it("Should put today's TSB value in both past and future", function()
                    {
                        expect(chartPoints.TSB[0][1]).to.eql(-20);
                        expect(chartPoints.TSBFuture[0][1]).to.eql(-20);
                    });

                    it("Should put future TSB value only in future", function()
                    {
                        expect(chartPoints.TSB[9][1]).to.eql(null);
                        expect(chartPoints.TSBFuture[9][1]).to.eql(-11);
                    });

                    it("Should include a date for each TSB point", function()
                    {
                        expect(
                            moment(chartPoints.TSBFuture[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.TSBFuture[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
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
                        expect(chartPoints.ATL).to.not.be.undefined;
                        expect(chartPoints.ATLFuture).to.not.be.undefined;
                        expect(chartPoints.ATL.length).to.eql(modelData.length);
                        expect(chartPoints.ATLFuture.length).to.eql(modelData.length);
                    });

                    it("Should put today's ATL value in both past and future", function()
                    {
                        expect(chartPoints.ATL[0][1]).to.eql(0);
                        expect(chartPoints.ATLFuture[0][1]).to.eql(0);
                    });

                    it("Should put future ATL value only in future", function()
                    {
                        expect(chartPoints.ATL[9][1]).to.eql(null);
                        expect(chartPoints.ATLFuture[9][1]).to.eql(45);
                    });

                    it("Should include a date for each ATL point", function()
                    {
                        expect(
                            moment(chartPoints.ATLFuture[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.ATLFuture[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
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
                        expect(chartPoints.IF).to.not.be.undefined;
                        expect(chartPoints.IFFuture).to.not.be.undefined;
                        expect(chartPoints.IF.length).to.eql(modelData.length);
                        expect(chartPoints.IFFuture.length).to.eql(modelData.length);
                    });

                    it("Should not put today's IF value in both past and future", function()
                    {
                        expect(chartPoints.IF[0][1]).to.eql(0);
                        expect(chartPoints.IFFuture[0][1]).to.eql(null);
                    });

                    it("Should put future IF value only in future", function()
                    {
                        expect(chartPoints.IF[9][1]).to.eql(null);
                        expect(chartPoints.IFFuture[9][1]).to.eql(9 * 0.11);
                    });

                    it("Should include a date for each IF point", function()
                    {
                        expect(
                            moment(chartPoints.IFFuture[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.IFFuture[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
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
                        expect(chartPoints.CTL).to.not.be.undefined;
                        expect(chartPoints.CTLFuture).to.not.be.undefined;
                        expect(chartPoints.CTL.length).to.eql(modelData.length);
                        expect(chartPoints.CTLFuture.length).to.eql(modelData.length);
                    });

                    it("Should put today's CTL value in both past and future", function()
                    {
                        expect(chartPoints.CTL[0][1]).to.eql(0);
                        expect(chartPoints.CTLFuture[0][1]).to.eql(0);
                    });

                    it("Should put future CTL value only in future", function()
                    {
                        expect(chartPoints.CTL[9][1]).to.eql(null);
                        expect(chartPoints.CTLFuture[9][1]).to.eql(180);
                    });

                    it("Should include a date for each CTL point", function()
                    {
                        expect(
                            moment(chartPoints.CTLFuture[0][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
                            moment().format(TP.utils.datetime.shortDateFormat)
                        );

                        expect(
                            moment(chartPoints.CTLFuture[9][0]).format(TP.utils.datetime.shortDateFormat)
                        ).to.eql(
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
                sinon.stub(chart, "shouldShowTSS").returns(true);
                sinon.stub(chart, "shouldShowIF").returns(true);
                sinon.stub(chart, "shouldShowTSBFill").returns(true);
                var chartPoints = chart.buildFlotPoints(modelData);
                chartSeries = chart.buildFlotDataSeries(chartPoints, chartColors);
            });

            // because we need an extra series for TSB future fill
            it("Should contain eleven items (five past, six future)", function()
            {
                expect(chartSeries.length).to.equal(11);
            });
        });

        describe("Chart title workout types", function()
        {

            it("Should say 'PMC - Workout Type: All' if no workout types are set", function()
            {
                expect(TP.utils.workout.types.getListOfNames([0], "All")).to.eql("All");
            });

            it("Should include workout types if set", function()
            {
                expect(TP.utils.workout.types.getListOfNames([1, 2, 3])).to.eql("Swim, Bike, Run");
            });

        });

        describe("Click on a data point", function()
        {
            var modelData;
            var chart;
            var workoutsCollection;
            var tomahawkView;

            beforeEach(function()
            {
                modelData = buildPmcModelData(10);
                chart = buildPmcChart();
                chart.rawData = modelData;
                chart.calendarManager = new CalendarManager({ dataManager: new DataManager() });
                sinon.stub(chart.calendarManager, "loadActivities");
                tomahawkView = chart.createItemDetailView({dataIndex: 2},{pageX: 10, pageY: 10});
            });

            it("Should instantiate a PmcWorkoutsListView", function()
            {
                expect(tomahawkView).to.not.be.undefined;
            });

        });

    });

});
