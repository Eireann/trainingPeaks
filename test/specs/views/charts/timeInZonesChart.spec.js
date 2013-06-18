// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "TP",
    "views/charts/timeInZonesChart",
    "utilities/charting/chartColors"
],
function (_, TP, TimeInZonesChartView, chartColors)
{
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
            expect(function () { new TimeInZonesChartView({ timeInZones: new TP.Model(), chartColor: {} }); }).toThrow("TimeInZonesChartView requires a graphTitle string at construction time");
            expect(function () { new TimeInZonesChartView({ timeInZones: new TP.Model(), chartColor: {}, graphTitle: "Title" }); }).toThrow("TimeInZonesChartView requires a toolTipBuilder callback at construction time");
            expect(function () { new TimeInZonesChartView({ timeInZones: new TP.Model(), chartColor: {}, graphTitle: "Title", toolTipBuilder: function () { } }); }).not.toThrow();
        });

        it("Should build chart points off a TimeInZones object, for flot", function ()
        {
            expect(typeof TimeInZonesChartView.prototype.buildTimeInZonesFlotPoints).toBe("function");

            var timeInZones = getTimeInZones();

            var chartPoints;
            expect(function () { chartPoints = TimeInZonesChartView.prototype.buildTimeInZonesFlotPoints.call(null, { timeInZones: timeInZones }); }).not.toThrow();
            expect(chartPoints.length).toEqual(timeInZones.length);

            _.each(timeInZones, function (timeInZone, index)
            {
                var chartPoint = chartPoints[index];
                expect(chartPoint[1] * 60).toEqual(timeInZone.seconds);
                expect(chartPoint[0]).toEqual(index);
            }, this);
        });

        it("Should not blow up", function ()
        {
            var timeInHRZones =
            {
                maximum: 196,
                resting: 42,
                threshold: 180,
                timeInZones: getTimeInZones()
            };

            var options =
            {
                timeInZones: timeInHRZones,
                chartColor: chartColors.gradients.heartRate,
                graphTitle: "I'm a chart title.",
                toolTipBuilder: function() { return { tooltips: [] }; }                
            };
            expect(function() { new TimeInZonesChartView(options); }).not.toThrow();
        });
    });

    var getTimeInZones = function ()
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
});