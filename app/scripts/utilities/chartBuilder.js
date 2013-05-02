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
                    min: this.findMinimum(chartData)
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
                    style: {
                        color: '#636569',
                        fontWeight: 'bold'
                    }
                },
                xAxis: {
                   labels:
                    {
                        enabled: false
                    },
                    title:
                    {
                        style: {
                            color: '#636569',
                            fontWeight: 'bold'
                        }
                    },
                    tickColor: 'transparent'
                },
                yAxis: {
                    min: 0,
                    alternateGridColor: "#cdcbcb",
                    tickInterval: 10,
                    title:
                    {
                        style: {
                            color: '#636569',
                            fontWeight: 'bold'
                        }
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

            container.highcharts(chartOptions);
        },

        formatMeanMaxLabel: function(label)
        {
            // Change MM100Meters to "100 Meters", or MMHalfMarathon to "Half Marathon"
            // change 1 Minute to 60 Seconds and 1 Hour to 60 Minutes
            return label.replace(/^MM/, "").replace(/([0-9]+)/g, "$1 ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/1 Minute/, "60 Seconds").replace(/1 Hour/, "60 minutes");
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

        cleanAndFormatPeaksData: function(peaksData)
        {

            var allPeaksByLabel = {};
            _.each(peaksData, function(peak)
            {
                allPeaksByLabel[peak.label] = peak;
            }, this);


            var enabledPeaks = [];
            _.each(this.defaultPeakSettings, function (label)
            {
                if (allPeaksByLabel.hasOwnProperty(label))
                {
                    var peak = allPeaksByLabel[label];
                    if (peak.value)
                    {
                        enabledPeaks.push(
                            {
                                label: this.formatMeanMaxLabel(peak.label),
                                value: peak.value
                            }
                        );
                    }
                }
            }, this);

            return enabledPeaks;
        },

        defaultPeakSettings: [
            'MM2Seconds',
            'MM5Seconds',
            'MM10Seconds',
            'MM12Seconds',
            'MM20Seconds',
            'MM30Seconds',
            'MM1Minute',
            'MM2Minutes',
            'MM5Minutes',
            'MM6Minutes',
            'MM10Minutes',
            'MM12Minutes',
            'MM20Minutes',
            'MM30Minutes',
            'MM1Hour',
            'MM90Minutes'
        ],

        getColumnTickInterval: function(points)
        {
            return this.getTickInterval(points);
        },

        getSplineTickInterval: function(points)
        {
            return this.getTickInterval(points);
        },

        getTickInterval: function(points)
        {
            var min = this.findMinimum(points);
            var max = this.findMaximum(points);
            var range = max - min;

            // 6 divisions will give 8 ticks including top and bottom
            var divisions = 6;

            if(range <= 1)
                return (max - min) / divisions;
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
        }

    };
});
