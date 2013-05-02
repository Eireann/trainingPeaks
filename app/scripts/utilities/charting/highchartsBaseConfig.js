define(
[
    "TP"
],
function(TP)
{
    return {
        chart:
        {
            type: "line",
            zoomType: null,
            resetZoomEnabled: false,
            alignTicks: true,
            backgroundColor: "transparent"
        },
        credits:
        {
            enabled: false
        },
        tooltip:
        {
            enabled: false
        },
        legend:
        {
            enabled: false,
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
            text: null
        },
        xAxis:
        {
            ordinal: false,
            type: "linear",
            labels:
            {
                formatter: function()
                {
                    var decimalHours = (this.value / (3600 * 1000)).toFixed(2);
                    return TP.utils.datetime.format.decimalHoursAsTime(decimalHours, true, null);
                }
            }
        },
        yAxis: [],
        series: [],
        plotOptions:
        {
            line:
            {
                connectNulls: false,
                gapSize: 1,
                turboThreshold: 100
            },
            area:
            {
                connectNulls: false,
                gapSize: 1,
                turboThreshold: 100
            },
            series:
            {
                pointStart: 0,
                pointInterval: 1000, //1 second
                allowPointSelector: true,
                animation: true,
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
        },
        navigator:
        {
            enabled: false
        },
        rangeSelector:
        {
            enabled: false
        }
    };
});