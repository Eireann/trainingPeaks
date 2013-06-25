// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "jquery",
    "moment",
    "TP",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app",
    "utilities/charting/chartColors",
    "views/dashboard/pmcChart"
],
function(
    $,
    moment,
    TP,
    testHelpers,
    xhrData,
    theMarsApp,
    chartColors,
    PmcChart
    )
{

    var buildPmcModelData = function(howManyItems)
    {
        modelData = [];

        for(var i = 0;i < howManyItems;i++)
        {
            modelData.push({
                workoutDay: moment().add("days", i).format(TP.utils.datetime.shortDateFormat),
                tssActual: i * 10,
                atl: i * 5,
                ctl: i * 20
            });
        }
  
        return modelData;
    };

    describe("PMC Chart View", function()
    {

        beforeEach(function()
        {
            testHelpers.startTheApp();
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should load successfully as a module", function()
        {
            expect(PmcChart).toBeDefined();
        });

        it("Should render without errors", function()
        {
            var chart = new PmcChart();
            var renderChart = function()
            {
                chart.render();
            };
            expect(renderChart).not.toThrow();
        });

        describe("Data parsing", function()
        {

            describe("TSS", function()
            {
                var chartPoints, chart, modelData;
                beforeEach(function()
                {
                    modelData = buildPmcModelData(10);
                    chart = new PmcChart();
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
                        expect(chartPoint[1]).toEqual(index * 10);
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
                        moment().add("days", 9).format(TP.utils.datetime.shortDateFormat)
                    );
                });
            });

            describe("ATL", function()
            {
                var chartPoints, chart, modelData;
                beforeEach(function()
                {
                    modelData = buildPmcModelData(10);
                    chart = new PmcChart();
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
                        moment().add("days", 9).format(TP.utils.datetime.shortDateFormat)
                    );
                });
            });

            describe("CTL", function()
            {
                var chartPoints, chart, modelData;
                beforeEach(function()
                {
                    modelData = buildPmcModelData(10);
                    chart = new PmcChart();
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
                        moment().add("days", 9).format(TP.utils.datetime.shortDateFormat)
                    );
                });
            });
        });

        describe("Build flot data series", function()
        {
            var chartSeries;

            beforeEach(function()
            {
                var modelData = buildPmcModelData(10);
                var chart = new PmcChart();
                var chartPoints = chart.buildFlotPoints(modelData);
                chartSeries = chart.buildFlotDataSeries(chartPoints, chartColors);
            });

            it("Should contain three items", function()
            {
                expect(chartSeries.length).toBe(3);
            });
        });

        describe("Chart title workout types", function()
        {

            it("Should say 'PMC - Workout Type: All' if no workout types are set", function()
            {
                expect(PmcChart.prototype.buildWorkoutTypesTitle([0])).toEqual("PMC - Workout Type: All");
            });

            it("Should include workout types if set", function()
            {
                expect(PmcChart.prototype.buildWorkoutTypesTitle([1, 2, 3])).toEqual("PMC - Workout Type: Swim, Bike, Run");
            });

        });


    });

});
