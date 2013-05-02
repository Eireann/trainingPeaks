define(
[],
function()
{
    return {

        renderColumnChart: function(container, chartData, tooltipTemplate, additionalChartOptions)
        {
            var chartOptions = {
                chart:
                {
                    type: "column"
                }
            };

            if (additionalChartOptions)
                $.extend(true, chartOptions, additionalChartOptions);

            return this.renderChart(container, chartData, tooltipTemplate, chartOptions);
        },

        renderSplineChart: function(container, chartData, tooltipTemplate, additionalChartOptions)
        {
            var chartOptions = {
                chart:
                {
                    type: "spline"
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

        cleanAndFormatPeaksData: function(peaksData)
        {

            var allPeaksByLabel = {};
            _.each(peaksData, function (peak)
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
                                label: TP.utils.chartBuilder.formatMeanMaxLabel(peak.label),
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
        ]

    };
});
