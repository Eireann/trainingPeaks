define(
[],
function()
{
    return {

        renderGraph: function(container, chartData, tooltipTemplate, additionalChartOptions)
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
                    }
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
        }
    };
});
