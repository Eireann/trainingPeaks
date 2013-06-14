﻿define(
[
    "underscore"
],
function(_)
{

    var titleFontStyle = {
        color: "#303030",
        fontFamily: "HelveticaNeueW01-75Bold",
        fontSize: "12px"
    };

    var axisFontStyle = {
        color: "#303030",
        fontFamily: "HelveticaNeueW01-55Roma",
        fontSize: "12px"
    };

    var tooltipFontStyle = {
        color: "#636569",
        fontFamily: "HelveticaNeueW01-55Roma",
        fontSize: "12px",
        backgroundColor: "rgba(255, 255, 255, 1)"
    };

    var positionToolTip = function(labelWidth, labelHeight, point)
    {

        // to right of cursor
        var x = point.plotX + (labelWidth / 2) + 50;
        var y = point.plotY - 10;

        // too far right? move it left
        if (x + labelWidth> this.chart.chartWidth)
        {
            x = point.plotX - (labelWidth / 2);
        }

        /*
        // too low? move it up
        if (y + labelHeight > (this.chart.chartHeight - 50))
        {
            y = this.chart.chartHeight - (labelHeight + 50);
        }

        // too high? move it down
        if (y <= 0)
        {
            y = 0;
        }

        // too far right? move it left
        if (x + labelWidth > (this.chart.chartWidth + 40))
        {
            x = point.plotX - labelWidth + 40;
        }

        // too far left? move it right
        if (x <= 100)
        {
            x = 100;
        }
        */
        
        return { x: x, y: y };
    };

    return {

        renderColumnChart: function(container, chartData, tooltipTemplate, additionalChartOptions)
        {
            var tickInterval = this.getColumnTickInterval(chartData);
            var chartOptions = {
                chart:
                {
                    type: "column"
                },
                plotOptions:
                {
                    column:
                    {
                        borderWidth: 0,

                        // actual chart width is approx container.width - 70px (axis labels etc), so divide that evenly between bars
                        pointWidth: Math.round(($(container).width() - 70) / chartData.length) - 5
                    }
                },
                yAxis:
                {
                    tickInterval: tickInterval,
                    min: 0
                    //min: this.findMinimum(chartData) - tickInterval
                }
            };

            if (additionalChartOptions)
                $.extend(true, chartOptions, additionalChartOptions);

            return this.renderChart(container, chartData, tooltipTemplate, chartOptions);
        },

        renderSplineChart: function(container, chartData, tooltipTemplate, additionalChartOptions)
        {
            var tickInterval = this.getSplineTickInterval(chartData);
            var chartOptions = {
                chart:
                {
                    type: "areaspline"
                },
                yAxis:
                {
                    tickInterval: tickInterval,
                    min: this.findMinimum(chartData)
                },
                plotOptions:
                {
                    areaspline:
                    {
                        connectNulls: true,
                        lineColor: "#FFFFFF",
                        lineWidth: 2,
                        marker:
                        {
                            enabled: false,
                            states:
                            {
                                hover:
                                {
                                    enabled: false
                                }
                            }
                        }
                    }
                }
            };

            if (additionalChartOptions)
                $.extend(true, chartOptions, additionalChartOptions);

            return this.renderChart(container, chartData, tooltipTemplate, chartOptions);
        },

        renderChart: function(container, chartData, tooltipTemplate, additionalChartOptions)
        {
            var chartOptions =
            {
                series: [{ data: chartData }],
                chart:
                {
                    type: "column",
                    backgroundColor: "transparent",
                    width: container.width(),
                    height: container.height()
                },
                credits:
                {
                    enabled: false
                },
                title:
                {
                    style: titleFontStyle
                },
                xAxis:
                {
                    offset: 3,
                    lineWidth: 1,
                    lineColor: "#636569",
                    labels:
                    {
                        enabled: false,
                        style: axisFontStyle,
                        useHTML: false
                    },
                    title:
                    {
                        style: axisFontStyle,
                        margin: 30
                    },
                    tickColor: 'transparent'
                },
                yAxis:
                {
                    lineWidth: 1,
                    lineColor: "#636569",
                    min: 0,
                    //alternateGridColor: "#cdcbcb",
                    tickInterval: 10,
                    title:
                    {
                        style: axisFontStyle,
                        margin: 30
                    },
                    labels:
                    {
                        style: axisFontStyle,
                        useHTML: false
                    }
                },
                legend:
                {
                    enabled: false
                },
                scrollbar:
                {
                    enabled: false
                },
                tooltip:
                {
                    formatter: function()
                    {
                        return tooltipTemplate(this.point.options);
                    },
                    positioner: positionToolTip,
                    followPointer: true,
                    shared: false,
                    useHTML: true,
                    borderColor: "transparent",
                    shadow: true,
                    borderRadius: 0,
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    style: tooltipFontStyle
                }
            };

            if (additionalChartOptions)
                $.extend(true, chartOptions, additionalChartOptions);

            if (additionalChartOptions.hasOwnProperty('colors'))
            {
                var colorGradients =
                {
                    colors: Highcharts.map(additionalChartOptions.colors, function(color)
                    {
                        return {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops:
                            [
                                [0, color.light],
                                [1, color.dark]
                            ]
                        };
                    })
                };


                $.extend(true, chartOptions, colorGradients);
            }

            if (container.highcharts)
                container.highcharts(chartOptions);

            return container.highcharts();
        },

        getPeakChartCategories: function(chartPoints)
        {
            var skipInterval = 2;
            var skip = 0;
            var categories = [];
            for (var i = 0; i < chartPoints.length; i++)
            {
                var addLabel = false;
                if (i === 0)
                {
                    addLabel = true;
                } else if (skip === skipInterval)
                {
                    addLabel = true;
                }


                if (addLabel)
                {
                    categories.push(this.formatPeakChartAxisLabel(chartPoints[i].label));
                    skip = 0;
                }
                else
                {
                    categories.push('');
                    skip++;
                }
            }
            return categories;
        },

        formatPeakChartAxisLabel: function (label)
        {
            return label.replace(/ /g, "").replace(/Minutes/, "m").replace(/Seconds/, "s").replace(/Hour/, "h");
        },

        getColumnTickInterval: function(points)
        {
            var max = this.findMaximum(points);
            return this.getTickInterval(0, max);
        },

        getSplineTickInterval: function(points)
        {
            var min = this.findMinimum(points);
            var max = this.findMaximum(points);
            return this.getTickInterval(min, max);
        },

        getTickInterval: function(min, max)
        {

            var range = max - min;

            // 6 divisions will give 8 ticks including top and bottom
            var divisions = 6;

            if (range <= 1)
                return parseFloat(Number((max - min) / divisions).toFixed(2));
            else if (range < 10)
                return 1;
            else 
                return Math.round((max - min) / divisions);
        },

        findMinimum: function(points)
        {
            var min = 0;

            _.each(points, function(point)
            {
                if ((!min && point.value) || (point.value && point.value < min))
                    min = point.value;
            });

            if (min < 0)
                min = 0;

            return min;
        },

        findMaximum: function(points)
        {
            var max = 0;

            _.each(points, function(point)
            {
                if (point.value && point.value > max)
                    max = point.value;
            });
            return max;
        },

        calculateTotalTimeInZones: function(timeInZones)
        {
            var totalSeconds = 0;

            _.each(timeInZones.timeInZones, function(timeInZone, index)
            {
                totalSeconds += Number(timeInZone.seconds);

            }, this);

            return totalSeconds;

        }

    };
});
