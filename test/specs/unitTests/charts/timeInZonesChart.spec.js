define(
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
            expect(TimeInZonesChartView).to.not.be.undefined;
        });

        it("Should check for valid initialization parameters", function ()
        {
            expect(function () { new TimeInZonesChartView({ model: new TP.Model() }); }).to.throw("TimeInZonesChartView requires a chartColor object at construction time");
            expect(function() { new TimeInZonesChartView({ model: new TP.Model(), chartColor: {} }); }).to.throw("TimeInZonesChartView requires a toolTipBuilder callback at construction time");
            expect(function() { new TimeInZonesChartView({ model: new TP.Model(), chartColor: {}, toolTipBuilder: function() { } }); }).to.not.throw();
        });

        describe("Build Chart Points", function()
        {


            var buildChartPoints = function()
            {
                return TimeInZonesChartView.prototype.buildTimeInZonesFlotPoints.call(null, { timeInZones: buildTimeInZones() });
            };

            it("Should build chart points", function()
            {
                expect(typeof TimeInZonesChartView.prototype.buildTimeInZonesFlotPoints).to.equal("function");
                expect(buildChartPoints).to.not.throw();
            });

            it("Should contain the correct number of points", function()
            {
                var timeInZones = buildTimeInZones();
                var chartPoints = buildChartPoints();
                expect(chartPoints.length).to.eql(timeInZones.length);
                expect(timeInZones.length).to.eql(10);
            });

            it("Should contain the correct minutes value for each point", function()
            {
                var timeInZones = buildTimeInZones();
                var chartPoints = buildChartPoints();
                _.each(timeInZones, function(timeInZone, index)
                {
                    var chartPoint = chartPoints[index];
                    expect(chartPoint).to.not.be.undefined;
                    expect(chartPoint.length).to.eql(2);
                    expect(chartPoint[1] * 60).to.eql(timeInZone.seconds);
                    expect(chartPoint[0]).to.eql(index);
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
                expect(dataSeries.length).to.equal(1);
            });

            it("Should contain the chart points", function()
            {
                expect(dataSeries[0].data).to.not.be.undefined;
                expect(dataSeries[0].data).to.equal(chartPoints);
            });

            it("Should contain a 'bars' definition, to create a bar chart", function()
            {
                expect(dataSeries[0].bars).to.not.be.undefined;
            });

            it("Should use the specified color gradient", function()
            {
                var bars = dataSeries[0].bars;
                expect(bars.fillColor).to.not.be.undefined;
                expect(bars.fillColor.colors).to.not.be.undefined;
                expect(bars.fillColor.colors).to.contain(chartColor.light);
                expect(bars.fillColor.colors).to.contain(chartColor.dark);
            });
        });

        describe("Build flot chart options", function()
        {
            var chartOptions = TimeInZonesChartView.prototype.buildTimeInZonesFlotChartOptions.call(null);

            it("Should enable bar graph display", function()
            {
                expect(chartOptions.series.bars).to.not.be.undefined;
                expect(chartOptions.series.bars.show).to.equal(true);
            });
        });

    });

});
