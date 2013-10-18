﻿// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "TP",
    "utilities/data/peaksGenerator",
    "views/charts/peaksChart"
],
function(
    _,
    TP,
    ThePeaksGenerator,
    PeaksChartView
)
{


    var buildPeaks = function(defaultPointValue)
    {
        var peaks = ThePeaksGenerator.generate("HeartRate", this.model);

        if (_.isUndefined(defaultPointValue))
        {
            _.each(peaks, function(peak, index)
            {
                peak.value = index * index + 1;
            });
        } else
        {
            _.each(peaks, function(peak, index)
            {
                peak.value = defaultPointValue;
            });
        }

        return peaks;
    };


    describe("Base PeaksChartView", function()
    {
        it("Should have a valid constructor", function ()
        {
            expect(PeaksChartView).toBeDefined();
        });

        it("Should check for valid initialization parameters", function ()
        {
            expect(function() { new PeaksChartView({ model: new TP.Model()  }); }).toThrow("PeaksChartView requires a chartColor object at construction time");
            expect(function() { new PeaksChartView({ model: new TP.Model(), chartColor: {} }); }).toThrow("PeaksChartView requires a toolTipBuilder callback at construction time");
            expect(function() { new PeaksChartView({ model: new TP.Model(), chartColor: {}, toolTipBuilder: function() { } }); }).not.toThrow();
        });

        describe("Build Chart Points", function()
        {


            var buildChartPoints = function(defaultPointValue)
            {
                return PeaksChartView.prototype.buildPeaksFlotPoints.call(null, buildPeaks(defaultPointValue));
            };

            it("Should build chart points", function()
            {
                expect(typeof PeaksChartView.prototype.buildPeaksFlotPoints).toBe("function");
                expect(buildChartPoints).not.toThrow();
            });

            it("Should contain the correct number of points", function()
            {
                var peaks = buildPeaks();
                var chartPoints = buildChartPoints();
                expect(chartPoints.length).toEqual(peaks.length);
            });

            it("Should contain the correct peak value for each point", function()
            {
                var peaks = buildPeaks();
                var chartPoints = buildChartPoints();
                _.each(peaks, function(peak, index)
                {
                    var chartPoint = chartPoints[index];
                    expect(chartPoint).toBeDefined();
                    expect(chartPoint.length).toEqual(2);
                    expect(chartPoint[1]).toEqual(peak.value);
                    expect(chartPoint[0]).toEqual(index);
                }, this);
            });

            it("Should preserve nulls", function()
            {
                var peaks = buildPeaks(null);
                var chartPoints = buildChartPoints(null);
                _.each(peaks, function(peak, index)
                {
                    var chartPoint = chartPoints[index];
                    expect(peak.value).toBe(null);
                    expect(chartPoint[1]).toEqual(null);
                }, this);
            });

            it("Should convert zeroes to null", function()
            {
                var peaks = buildPeaks(0);
                var chartPoints = buildChartPoints(0);
                _.each(peaks, function(peak, index)
                {
                    var chartPoint = chartPoints[index];
                    expect(peak.value).toEqual(0);
                    expect(chartPoint[1]).toEqual(null);
                }, this);
            });
        });

        describe("Build Data Series", function()
        {

            var chartColor = { light: '#FF0000', dark: '#660000' };
            var peaks = buildPeaks();
            var chartPoints = PeaksChartView.prototype.buildPeaksFlotPoints.call(null, peaks);
            var dataSeries = PeaksChartView.prototype.buildPeaksFlotDataSeries.call(null, chartPoints, chartColor);

            it("Should return a one-item array", function()
            {
                expect(dataSeries.length).toBe(1);
            });

            it("Should contain the chart points", function()
            {
                expect(dataSeries[0].data).toBeDefined();
                expect(dataSeries[0].data).toBe(chartPoints);
            });

            it("Should contain a 'lines' definition, to create a bar chart", function()
            {
                expect(dataSeries[0].lines).toBeDefined();
            });

            it("Should use the specified color gradient", function()
            {
                var lines = dataSeries[0].lines;
                expect(lines.fillColor).toBeDefined();
                expect(lines.fillColor.colors).toBeDefined();
                expect(lines.fillColor.colors).toContain(chartColor.light);
                expect(lines.fillColor.colors).toContain(chartColor.dark);
            });
        });

        describe("Build flot chart options", function()
        {
            var chartOptions = PeaksChartView.prototype.buildFlotChartOptions.call({ calculateYAxisMinimum: function() { return 0; }});

            it("Should enable line graph display", function()
            {
                expect(chartOptions.series.lines).toBeDefined();
                expect(chartOptions.series.lines.show).toBe(true);
            });
        });

    });

});
