define(
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
            expect(PeaksChartView).to.not.be.undefined;
        });

        it("Should check for valid initialization parameters", function ()
        {
            expect(function() { new PeaksChartView({ model: new TP.Model()  }); }).to.throw("PeaksChartView requires a chartColor object at construction time");
            expect(function() { new PeaksChartView({ model: new TP.Model(), chartColor: {} }); }).to.throw("PeaksChartView requires a toolTipBuilder callback at construction time");
            expect(function() { new PeaksChartView({ model: new TP.Model(), chartColor: {}, toolTipBuilder: function() { } }); }).to.not.throw();
        });

        describe("Build Chart Points", function()
        {


            var buildChartPoints = function(defaultPointValue)
            {
                return PeaksChartView.prototype.buildPeaksFlotPoints.call(null, buildPeaks(defaultPointValue));
            };

            it("Should build chart points", function()
            {
                expect(typeof PeaksChartView.prototype.buildPeaksFlotPoints).to.equal("function");
                expect(buildChartPoints).to.not.throw();
            });

            it("Should contain the correct number of points", function()
            {
                var peaks = buildPeaks();
                var chartPoints = buildChartPoints();
                expect(chartPoints.length).to.eql(peaks.length);
            });

            it("Should contain the correct peak value for each point", function()
            {
                var peaks = buildPeaks();
                var chartPoints = buildChartPoints();
                _.each(peaks, function(peak, index)
                {
                    var chartPoint = chartPoints[index];
                    expect(chartPoint).to.not.be.undefined;
                    expect(chartPoint.length).to.eql(2);
                    expect(chartPoint[1]).to.eql(peak.value);
                    expect(chartPoint[0]).to.eql(index);
                }, this);
            });

            it("Should preserve nulls", function()
            {
                var peaks = buildPeaks(null);
                var chartPoints = buildChartPoints(null);
                _.each(peaks, function(peak, index)
                {
                    var chartPoint = chartPoints[index];
                    expect(peak.value).to.equal(null);
                    expect(chartPoint[1]).to.eql(null);
                }, this);
            });

            it("Should convert zeroes to null", function()
            {
                var peaks = buildPeaks(0);
                var chartPoints = buildChartPoints(0);
                _.each(peaks, function(peak, index)
                {
                    var chartPoint = chartPoints[index];
                    expect(peak.value).to.eql(0);
                    expect(chartPoint[1]).to.eql(null);
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
                expect(dataSeries.length).to.equal(1);
            });

            it("Should contain the chart points", function()
            {
                expect(dataSeries[0].data).to.not.be.undefined;
                expect(dataSeries[0].data).to.equal(chartPoints);
            });

            it("Should contain a 'lines' definition, to create a bar chart", function()
            {
                expect(dataSeries[0].lines).to.not.be.undefined;
            });

            it("Should use the specified color gradient", function()
            {
                var lines = dataSeries[0].lines;
                expect(lines.fillColor).to.not.be.undefined;
                expect(lines.fillColor.colors).to.not.be.undefined;
                expect(lines.fillColor.colors).to.contain(chartColor.light);
                expect(lines.fillColor.colors).to.contain(chartColor.dark);
            });
        });

        describe("Build flot chart options", function()
        {
            var chartOptions = PeaksChartView.prototype.buildFlotChartOptions.call({ calculateYAxisMinimum: function() { return 0; }});

            it("Should enable line graph display", function()
            {
                expect(chartOptions.series.lines).to.not.be.undefined;
                expect(chartOptions.series.lines.show).to.equal(true);
            });
        });

    });

});
