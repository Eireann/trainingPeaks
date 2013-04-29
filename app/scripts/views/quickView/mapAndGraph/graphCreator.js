define(
[
    "underscore"
],
function (_)
{
    var yAxes =
    {
        "HeartRate":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#FF0000",
            lineWidth: 0,
            max: null, // Null means max is auto-calced
            min: 0,
            minTickInterval: 5,
            type: "linear"
        },
        "Power":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#FF0000",
            lineWidth: 0,
            max: null, // Null means max is auto-calced
            min: 0,
            minTickInterval: 5,
            type: "linear"
        },
        "Cadence":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#FF0000",
            lineWidth: 0,
            max: null, // Null means max is auto-calced
            min: 0,
            minTickInterval: 5,
            type: "linear"
        },
        "Speed":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#FF0000",
            lineWidth: 0,
            max: null, // Null means max is auto-calced
            min: 0,
            minTickInterval: 5,
            type: "linear"
        },
        "Temperature":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#FF0000",
            lineWidth: 0,
            max: null, // Null means max is auto-calced
            min: 0,
            minTickInterval: 5,
            type: "linear"
        },
        "Elevation":
        {
            allowDecimals: false,
            endOnTick: true,
            gridLineWidth: 1,
            labels:
            {
                enabled: false
            },
            lineColor: "#FF0000",
            lineWidth: 0,
            max: null, // Null means max is auto-calced
            min: 0,
            minTickInterval: 5,
            type: "linear",
            opposite: true
        }
    };
    
    return function(container, seriesArray)
    {
        var orderedAxes = [];
        
        _.each(seriesArray, function(series)
        {
            orderedAxes.push(yAxes[series.name]);
        });

        var seriesConfig = [];
        _.each(seriesArray, function(seriesItem, index)
        {
            seriesConfig.push({ name: seriesItem.name, yAxis: index, data: seriesItem.data });
        });
        
        container.highcharts(
            {
                chart:
                {
                    type: "line",
                    zoomType: "x",
                    resetZoomEnabled: true,
                    alignTicks: true,
                    width: 620,
                    height: 170,
                    backgroundColor: 'transparent'
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
                    text: null
                },
                xAxis:
                {
                    ordinal: false,
                    type: 'linear',
                    labels:
                    {
                        formatter: function ()
                        {
                            return (this.value / (3600 * 1000)).toFixed(2);
                        }
                    }
                },
                yAxis: orderedAxes,
                series: seriesConfig,
                plotOptions:
                {
                    line:
                    {
                        connectNulls: true,
                        turboThreshold: 100
                    },
                    series:
                    {
                        pointStart: 0,
                        pointInterval: 1000, //1 second
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
