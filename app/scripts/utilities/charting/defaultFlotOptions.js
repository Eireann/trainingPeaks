define(
[
    "TP",
    "utilities/charting/jquery.flot.filter",
    "utilities/charting/chartColors"
],
function(TP, flotFilter, chartColors)
{
    return function(onHoverHandler)
    {
        return _.extend({},
        {
            crosshair:
            {
                mode: "x",
                color: "rgba(255, 255, 255, 0.80)",
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
                mode: null,
                color: chartColors.chartSelection
            },
            tooltip: true,
            tooltipOpts:
            {
                content: function()
                {
                    return "";
                },
                onHover: onHoverHandler,
                defaultTheme: false
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

            shifts:
            {
                x: 0,
                y: 0
            },
            xaxes:
            [
                {
                    min: 0,
                    color: "transparent",
                    tickColor: "transparent",

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
                        else if(axis.tickSize <= 1500000)
                                axis.tickSize = 1500000;
                        else if (axis.tickSize <= 1800000)
                            axis.tickSize = 1800000;
                        else if (axis.tickSize <= 2100000)
                            axis.tickSize = 2100000;
                        else if (axis.tickSize <= 2400000)
                            axis.tickSize = 2400000;
                        else if (axis.tickSize <= 2700000)
                            axis.tickSize = 2700000;
                        else
                            axis.tickSize -= (axis.tickSize % 3000000);
                        
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