define(
[
    "underscore",
    "TP",
    "utilities/charting/jquery.flot.filter",
    "utilities/charting/chartColors"
],
function (_, TP, flotFilter, chartColors)
{
    return {
        getMultiChannelOptions: function (onHoverHandler, axisType, workoutTypeId)
        {
            return _.extend(this.getGlobalDefaultOptions(onHoverHandler),
                {
                    crosshair:
                    {
                        mode: "x",
                        color: "rgba(255, 255, 255, 0.80)",
                        lineWidth: 1
                    },
                    selection:
                    {
                        mode: null,
                        color: chartColors.chartSelection
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
                            color: "transparent",
                            tickColor: "transparent",
                            tickFormatter: function (value, axis)
                            {
                                if (axisType && axisType === "distance")
                                    return TP.utils.conversion.formatUnitsValue("distance", value, { defaultValue: null, workoutTypeId: workoutTypeId }) + " " + TP.utils.units.getUnitsLabel("distance", workoutTypeId);

                                var decimalHours = (value / (3600 * 1000));
                                return TP.utils.datetime.format.decimalHoursAsTime(decimalHours, true, null);
                            },
                            ticks: function (axis)
                            {
                                var ticksArray = [];
                                var max = axis.datamax;

                                if (axisType && axisType === "time")
                                {
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
                                    else if (axis.tickSize <= 1500000)
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
                                }

                                while (max > 0)
                                {
                                    if (axisType && axisType === "distance")
                                        max -= axis.tickSize;
                                    ticksArray.push(axis.datamax - max);
                                    max -= axis.tickSize;
                                }

                                return ticksArray;
                            }
                        }
                    ]
                });
        },

        getBarOptions: function (onHoverHandler)
        {
            return _.extend(this.getGlobalDefaultOptions(onHoverHandler),
                {
                    series:
                    {
                        bars: { show: true }
                    },
                    bars:
                    {
                        align: "left",
                        barWidth: 0.8
                    }
                });
        },

        getSplineOptions: function (onHoverHandler)
        {
            return _.extend(this.getGlobalDefaultOptions(onHoverHandler), {
                series:
                {
                    lines:
                    {
                        show: true,
                        lineWidth: 1,
                        fill: true
                    }
                }
            });
        },

        getPointOptions: function (onHoverHandler, axisType, workoutTypeId)
        {
            return _.extend(this.getGlobalDefaultOptions(onHoverHandler),
                {
                    selection:
                    {
                        mode: null,
                        color: chartColors.chartSelection
                    },
                    series:
                    {
                        points:
                        {
                            show: true,
                            fill: false,
                            radius: 1,
                            symbol: function cross(ctx, x, y, radius, shadow) {
                                var size = radius * Math.sqrt(Math.PI) / 2;
                                ctx.moveTo(x - size, y - size);
                                ctx.lineTo(x + size, y + size);
                                ctx.moveTo(x - size, y + size);
                                ctx.lineTo(x + size, y - size);
                            }
                        }
                    },
                    bars:
                    {
                        align: "left",
                        barWidth: 0.8
                    },
                    xaxes:
                    [
                        {
                            min: 0,
                            color: "transparent",
                            tickColor: "transparent",

                            tickFormatter: function (value, axis)
                            {
                                var formattedValue = TP.utils.conversion.formatUnitsValue(axisType, value, { defaultValue: 0, workoutTypeId: workoutTypeId });
                                if (axisType !== "time")
                                {
                                    formattedValue = formattedValue + " " + TP.utils.units.getUnitsLabel(axisType, workoutTypeId);
                                }
                                return formattedValue;
                            },
                            ticks: function (axis)
                            {
                                var ticksArray = [];
                                var max = axis.datamax;

                                if (axisType && axisType === "time")
                                {
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
                                    else if (axis.tickSize <= 1500000)
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
                                }

                                while (max > 0)
                                {
                                    if (axisType && axisType === "distance")
                                        max -= axis.tickSize;
                                    ticksArray.push(axis.datamax - max);
                                    max -= axis.tickSize;
                                }

                                return ticksArray;
                            }
                        }
                    ]
                });
        },

        getGlobalDefaultOptions: function (onHoverHandler)
        {
            return _.extend({}, {
                grid:
                {
                    show: true,
                    borderWidth: { left: 1, bottom: 1, top: 0, right: 0 },
                    borderOffset: { left: 2, bottom: 2, top: 0, right: 0 },
                    axisOffset: { left: 2, bottom: 2, top: 0, right: 2},
                    borderColor: "#c4c2c3",
                    hoverable: true,
                    clickable: true
                },
                legend:
                {
                    show: false
                },
                shifts:
                {
                    x: 0,
                    y: 0
                },
                tooltip: true,
                tooltipOpts:
                {
                    content: function ()
                    {
                        return "";
                    },
                    onHover: onHoverHandler,
                    defaultTheme: false
                }
            });
        }
    };
});
