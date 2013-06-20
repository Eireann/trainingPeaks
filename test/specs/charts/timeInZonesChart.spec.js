// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "TP",
    "views/charts/timeInZonesChart"
],
function(
    _,
    TP,
    TimeInZonesChartView
    )
{


    var buildTimeInZones = function ()
    {
        var timeInZones = [];
        for (var i = 0; i < 10; i++)
        {
            timeInZones.push(
            {
                seconds: i * 10,
                label: "Zone " + i,
                minimum: i * 1.2,
                maximum: i * 1.5
            });
        }

        return timeInZones;
    };

    describe("Base TimeInZonesChartView", function ()
    {
        it("Should have a valid constructor", function ()
        {
            expect(TimeInZonesChartView).toBeDefined();
        });

        it("Should check for valid initialization parameters", function ()
        {
            expect(function () { new TimeInZonesChartView({}); }).toThrow("TimeInZonesChartView requires a timeInZones object at construction time");
            expect(function () { new TimeInZonesChartView({ timeInZones: new TP.Model() }); }).toThrow("TimeInZonesChartView requires a chartColor object at construction time");
            expect(function() { new TimeInZonesChartView({ timeInZones: new TP.Model(), chartColor: {} }); }).toThrow("TimeInZonesChartView requires a toolTipBuilder callback at construction time");
            expect(function() { new TimeInZonesChartView({ timeInZones: new TP.Model(), chartColor: {}, toolTipBuilder: function() { } }); }).not.toThrow();
        });

        describe("Build Chart Points", function()
        {


            var buildChartPoints = function()
            {
                return TimeInZonesChartView.prototype.buildTimeInZonesFlotPoints.call(null, { timeInZones: buildTimeInZones() });
            };

            it("Should build chart points", function()
            {
                expect(typeof TimeInZonesChartView.prototype.buildTimeInZonesFlotPoints).toBe("function");
                expect(buildChartPoints).not.toThrow();
            });

            it("Should contain the correct number of points", function()
            {
                var timeInZones = buildTimeInZones();
                var chartPoints = buildChartPoints();
                expect(chartPoints.length).toEqual(timeInZones.length);
                expect(timeInZones.length).toEqual(10);
            });

            it("Should contain the correct minutes value for each point", function()
            {
                var timeInZones = buildTimeInZones();
                var chartPoints = buildChartPoints();
                _.each(timeInZones, function(timeInZone, index)
                {
                    var chartPoint = chartPoints[index];
                    expect(chartPoint).toBeDefined();
                    expect(chartPoint.length).toEqual(2);
                    expect(chartPoint[1] * 60).toEqual(timeInZone.seconds);
                    expect(chartPoint[0]).toEqual(index);
                }, this);
            });
        });

        describe("Build Data Series", function()
        {

            var chartColor = { light: '#FF0000', dark: '#660000' };
            var timeInZones = buildTimeInZones();
            var chartPoints = TimeInZonesChartView.prototype.buildTimeInZonesFlotPoints.call(null, { timeInZones: timeInZones });
            var dataSeries = TimeInZonesChartView.prototype.buildTimeInZonesFlotDataSeries.call(null, chartPoints, chartColor);

            it("Should return a one-item array", function()
            {
                expect(dataSeries.length).toBe(1);
            });

            it("Should contain the chart points", function()
            {
                expect(dataSeries[0].data).toBeDefined();
                expect(dataSeries[0].data).toBe(chartPoints);
            });

            it("Should contain a 'bars' definition, to create a bar chart", function()
            {
                expect(dataSeries[0].bars).toBeDefined();
            });

            it("Should use the specified color gradient", function()
            {
                var bars = dataSeries[0].bars;
                expect(bars.fillColor).toBeDefined();
                expect(bars.fillColor.colors).toBeDefined();
                expect(bars.fillColor.colors).toContain(chartColor.light);
                expect(bars.fillColor.colors).toContain(chartColor.dark);
            });
        });

        describe("Build flot chart options", function()
        {
            var chartOptions = TimeInZonesChartView.prototype.buildTimeInZonesFlotChartOptions.call(null);

            it("Should enable bar graph display", function()
            {
                expect(chartOptions.series.bars).toBeDefined();
                expect(chartOptions.series.bars.show).toBe(true);
            });
        });

    });

});