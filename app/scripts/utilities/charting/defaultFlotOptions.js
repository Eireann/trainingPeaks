define(
[
    "TP",
    "utilities/charting/flotCustomTooltip",
    "utilities/charting/jquery.flot.filter"
],
function(TP, flotCustomToolTip)
{
    return function(series, workoutType)
    {
        return _.extend({}, {
            crosshair:
            {
                mode: "x",
                color: "rgba(170, 0, 0, 0.80)",
                lineWidth: 1
                
            },
            grid:
            {
                show: true,
                borderWidth: 0,
                hoverable: true,
                clickable: true
            },
            legend:
            {
                show: false
            },
            selection:
            {
                mode: null
            },
            tooltip: true,
            tooltipOpts:
            {
                content: function()
                {
                    return "";
                },
                onHover: function(flotItem, $tooltipEl)
                {
                    $tooltipEl.html(flotCustomToolTip(series, flotItem.series.label, flotItem.dataIndex, flotItem.datapoint[0], workoutType));
                }
            },
            series:
            {
                lines:
                {
                    show: true,
                    lineWidth: 0.75,
                    fill: false,
                    hoverable: true
                }
            },
            xaxes:
            [
                {
                    min: 0,
                    tickFormatter: function(value, axis)
                    {
                        var decimalHours = (value / (3600 * 1000));
                        return TP.utils.datetime.format.decimalHoursAsTime(decimalHours, true, null);
                    },
                    ticks: function(axis)
                    {
                        var ticksArray = [];

                        if (axis.tickSize <= 120000)
                            axis.tickSize = 120000;
                        else if (axis.tickSize <= 300000)
                            axis.tickSize = 300000;
                        else if (axis.tickSize <= 600000)
                            axis.tickSize = 600000;
                        else if (axis.tickSize <= 900000)
                            axis.tickSize = 900000;
                        else if (axis.tickSize <= 1200000)
                            axis.tickSize = 1200000;
                        else
                            axis.tickSize -= (axis.tickSize % 1500000);
                        
                        var max = axis.datamax;
                        while (max > 0)
                        {
                            ticksArray.push(axis.datamax - max);
                            max -= axis.tickSize;
                        }
                        return ticksArray;
                    }
                }
            ]
        });
    };
});