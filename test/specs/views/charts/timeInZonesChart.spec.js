﻿// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "TP",
    "views/charts/timeInZonesChart"
],
function(_, TP, TimeInZonesChartView)
{
    describe("Base TimeInZonesChartView", function()
    {
        it("Should have a valid constructor", function()
        {
            expect(TimeInZonesChartView).toBeDefined();
        });

        it("Should check for valid initialization parameters", function()
        {
            expect(function () { new TimeInZonesChartView({}); }).toThrow("TimeInZonesChartView requires a timeInZones object at construction time");
            expect(function() { new TimeInZonesChartView({ timeInZones: new TP.Model() }); }).toThrow("TimeInZonesChartView requires a chartColor object at construction time");
            expect(function() { new TimeInZonesChartView({ timeInZones: new TP.Model(), chartColor: {} }); }).toThrow("TimeInZonesChartView requires a graphTitle string at construction time");
            expect(function() { new TimeInZonesChartView({ timeInZones: new TP.Model(), chartColor: {}, graphTitle: "Title" }); }).toThrow("TimeInZonesChartView requires a toolTipBuilder callback at construction time");
            expect(function() { new TimeInZonesChartView({ timeInZones: new TP.Model(), chartColor: {}, graphTitle: "Title", toolTipBuilder: function() {} }); }).not.toThrow();
        });

        it("Should build chart points off a TimeInZones object", function()
        {
            expect(typeof TimeInZonesChartView.prototype.buildTimeInZonesChartPoints).toBe("function");

            var context =
            {
                toolTipBuilder: function()
                {
                }
            };
            
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

            var chartPoints;
            expect(function () { chartPoints = TimeInZonesChartView.prototype.buildTimeInZonesChartPoints.call(context, { timeInZones: timeInZones }); }).not.toThrow();
            expect(chartPoints.length).toEqual(timeInZones.length);
        });
    });
});