define(
[
    "underscore"
],
function(_)
{
    return {

        renderColumnChart: function(container, chartData, tooltipTemplate, additionalChartOptions)
        {
            var tickInterval = this.getColumnTickInterval(chartData);
            var chartOptions = {
                chart:
                {
                    type: "column"
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
                    type: "spline"
                },
                yAxis:
                {
                    tickInterval: tickInterval,
                    min: this.findMinimum(chartData)
                },
                plotOptions:
                {
                    spline:
                    {
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
            var chartFontStyle = {
                color: "#636569",
                fontFamily: "HelveticaNeueW01-65Medi",
                fontSize: "12px",
                fontWeight: "normal"
            };

            var chartOptions = {
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
                    style: chartFontStyle
                },
                xAxis: {
                   labels:
                    {
                        enabled: false
                    },
                    title:
                    {
                        style: chartFontStyle
                    },
                    tickColor: 'transparent'
                },
                yAxis: {
                    min: 0,
                    alternateGridColor: "#cdcbcb",
                    tickInterval: 10,
                    title:
                    {
                        style: chartFontStyle
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
                tooltip: {
                    formatter: function()
                    {
                        return tooltipTemplate(this.point.options);
                    },
                    shared: false,
                    useHTML: true,
                    borderColor: "transparent",
                    shadow: true,
                    borderRadius: 3
                }
            };

            if (additionalChartOptions)
                $.extend(true, chartOptions, additionalChartOptions);

            if (container.highcharts)
                container.highcharts(chartOptions);
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
            return label.replace(/ /g, "").replace(/Minutes/, "min").replace(/Seconds/, "sec").replace(/Hour/, "hr");
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
