define(
[
],
function ()
{
    return function(container, seriesArray)
    {
        container.highcharts(
            {
                chart:
                {
                    type: "line",
                    zoomType: "x",
                    resetZoomEnabled: true,
                    alignTicks: true,
                    width: 622,
                    height: 340
                },
                credits:
                {
                    enabled: false
                },
                legend:
                {
                    enabled: true,
                    backgroundColor: '#FFFFFF',
                    layout: "horizontal",
                    verticalAlign: "top",
                    floating: false,
                    align: "center",
                    x: 0,
                    y: 0
                },
                scrollbar:
                {
                    enabled: false
                },
                title:
                {
                    text: "TP Chart"
                },
                yAxis:
                [
                    {
                        title:
                        {
                            text: "Heart Rate"
                        },
                        gridLineWidth: 1,
                        min: 0
                    }
                ],
                series: seriesArray,
                plotOptions:
                {
                    line:
                    {
                        connectNulls: true,
                        turboThreshold: 100
                    },
                    series:
                    {
                        allowPointSelector: true,
                        animation: false,
                        cursor: "pointer",
                        lineWidth: 1,
                        marker:
                        {
                            enabled: false
                        },
                        shadow: false,
                        states:
                        {
                            hover:
                            {
                                enabled: false
                            }
                        },
                        showCheckbox: false
                    }
                }
            });
    };
});
