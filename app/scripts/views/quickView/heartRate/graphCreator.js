define(
[],
function()
{
    return {

        renderTimeInZonesGraph: function(container, chartData, tooltipTemplate)
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
                title:
                {
                    text: "Heart Rate by Zones"
                },
                credits:
                {
                    enabled: false
                },
                xAxis: {
                    title:
                    {
                        text: "Zones"
                    },
                    labels:
                    {
                        enabled: false
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Minutes'
                    },
                    alternateGridColor: "#cdcbcb",
                    tickInterval: 10
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
                    formatter: this.formatToolTip,
                    shared: false,
                    useHTML: true
                }
            };

            container.highcharts(chartOptions);
        },

        formatToolTip: function()
        {
            return tooltipTemplate(this.point.options);
        }
    };
});
