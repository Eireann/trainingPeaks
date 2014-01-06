define(
[
    "underscore",
    "TP",
    "utilities/charting/jquery.flot.filter",
    "utilities/charting/chartColors",
    "utilities/charting/flotutils"
],
function (_, TP, flotFilter, chartColors, FlotUtils)
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
                                {
                                    if(!value)
                                    {
                                        return ""; // don't return null, as flot coerces it to a string ...
                                    }
                                    return TP.utils.conversion.formatUnitsValue("distance", value, { defaultValue: "", workoutTypeId: workoutTypeId }) + " " + TP.utils.units.getUnitsLabel("distance", workoutTypeId);
                                }

                                var decimalHours = (value / (3600 * 1000));
                                return TP.utils.datetime.formatter.decimalHoursAsTime(decimalHours, true, null);
                            },
                            ticks: FlotUtils.createTicksBasedOnAxis(axisType)
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
            var lowerCaseAxisName = axisType.toLowerCase();

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
                            font:
                            {
                                color: chartColors.seriesColorByChannel[axisType]
                            },
                            tickFormatter: function (value, axis)
                            {
                                var formattedValue = TP.utils.conversion.formatUnitsValue(lowerCaseAxisName, value, { defaultValue: 0, workoutTypeId: workoutTypeId });
                                if (lowerCaseAxisName !== "time")
                                {
                                    formattedValue = formattedValue + " " + TP.utils.units.getUnitsLabel(lowerCaseAxisName, workoutTypeId);
                                }
                                return formattedValue;
                            },
                            ticks: FlotUtils.createTicksBasedOnAxis(axisType)
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
