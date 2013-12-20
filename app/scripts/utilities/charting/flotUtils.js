define(
[
    "underscore",
    "utilities/charting/chartColors",
    "utilities/charting/dataParserUtils",
    "utilities/conversion/conversion"
],
function(_, chartColors, DataParserUtils, conversion)
{
    var FlotUtils =
    {
        generateYAxes: function(series, workoutTypeValueId, graphData)
        {
            var yaxes = [];
            var axisIndex = 1;

            var hasRightPower = DataParserUtils.findChannelInSeriesArray(series, "RightPower") ? true : false;

            _.each(series, function(s)
            {
                var showSpeedAsPace = s.label === "Speed" && _.contains([1,3,12,13], workoutTypeValueId);
                if (s.label === "Pace")
                    return;

                s.yaxis = axisIndex;
                if(s.label !== "Power" || !hasRightPower) // if we have both power and right power, they should share the same y axis
                {
                    axisIndex++;
                }

                var labelWidth = 15;
                if(showSpeedAsPace)
                {
                    labelWidth = 27;
                }
                else if(s.label === "Time")
                {
                    labelWidth = 42;
                }
                else if(s.label === "RightPower")
                {
                    labelWidth = 60;
                }

                var axisOptions =
                {
                    show: true,
                    label: s.label,
                    min: graphData.getMinimumForAxis(s.label),
                    color: "transparent",
                    tickColor: "transparent",
                    font:
                    {
                        color: chartColors.seriesColorByChannel[s.label]
                    },
                    tickFormatter: function(value)
                    {
                        // Purposefully using the closure created above to capture s.label for each given axis,
                        // in order to easily obtain the correct unit conversion for each axis.
                        // For some reason, a '0' value returns a NaN, check for it.

                        // Swim workouts need to format "Speed" as "Pace"
                        if (showSpeedAsPace)
                        {
                            return value === 0 ? +0 : conversion.formatUnitsValue("pace", value, { defaultValue: null, workoutTypeId: workoutTypeValueId } );
                        }
                        else if(s.label === "Time")
                        {
                            return conversion.formatUnitsValue("time", value);
                        }
                        return value === 0 && s.label !== "Temperature" ? +0 : parseInt(conversion.formatUnitsValue(s.label.toLowerCase(), value, {workoutTypeValueId: workoutTypeValueId}), 10);
                    },
                    labelWidth: labelWidth,
                    ticks: this.createTicksBasedOnAxis(s.label)
                };

                yaxes.push(axisOptions);
            }, this);

            // right power should share index with power if present
            var rightPowerAxis = DataParserUtils.findChannelInSeriesArray(yaxes, "RightPower");
            var powerAxis = DataParserUtils.findChannelInSeriesArray(yaxes, "Power");
            if(rightPowerAxis && powerAxis)
            {
                yaxes = _.without(yaxes, rightPowerAxis);
            }

            // distribute them on right first then left
            _.each(yaxes, function(axis, index)
            {
                if(index < (yaxes.length / 2))
                {
                    axis.position = "right";
                }
                else
                {
                    axis.position = "left";
                }
            });

            return yaxes;
        },

        seriesOptions: function(data, channel, options)
        {
            var fillOpacity = channel === "Elevation" ? 0.3 : null;

            var seriesOptions =
            {
                color: chartColors.seriesColorByChannel[channel],
                data: data,
                label: channel,
                lines:
                {
                    fill: fillOpacity
                },
                shadowSize: 0
            };

            // right power should be dashed
            if(channel === "RightPower")
            {
                seriesOptions.lines = {
                    show: false
                };
                seriesOptions.dashes = {
                    show: true,
                    lineWidth: 1
                };
            }

            if (channel === "Elevation")
            {
                seriesOptions.color = "#FFFFFF";
                seriesOptions.lines.fillColor = { colors: [chartColors.gradients.elevation.dark, chartColors.gradients.elevation.light] };

                // This is a hack to only append a y axis offset for graphing once for negative elevation values.
                if(data[0].length < 3)
                {
                    _.each(data, function(dataPoint)
                    {
                        dataPoint.push(options.minElevation);
                    });
                }
            }

            return seriesOptions;
        },

        createBullseye: function(radius)
        {
            var bullseye =
            {
                points:
                {
                    show: true,
                    fill: false,
                    radius: radius,
                    lineWidth: 0.50,
                    symbol: function bullseye(ctx, x, y, radius, shadow)
                    {
                        ctx.arc(x, y, radius, 0, shadow ? Math.PI : Math.PI * 2, false);
                        ctx.moveTo(x + 2 * radius, y);
                        ctx.arc(x, y, 2 * radius, 0, shadow ? Math.PI : Math.PI * 2, false);
                    }
                }
            };

            return bullseye;
        },

        createTicksBasedOnAxis: function(axisName)
        {
            var _func;
            if(axisName === "RightPower")
            {
                _func = this.createPercentageTicks();
            }
            else
            {
                _func = this.createTicks();
            }
            return _func;
        },

        createPercentageTicks: function()
        {
            var _func = function(axis)
            {
                var tick = axis.max / 5;
                var tickArray = [];
                for(var i = 0; i < 6; i++)
                {
                    var index = i * 20;
                    var percent = (100 - index) + "% / " + index + "%";
                    tickArray.push([i * tick, percent]);
                }
                return tickArray;
            };
            return _func;
        },

        createTicks: function(axisName)
        {
            var _func = function(axis)
            {
                if (axisName && axisName === "time")
                {
                    if (axis.tickSize <= 120000)
                    {
                        axis.tickSize = 120000;
                    }
                    else
                    {
                        axis.tickSize = Math.ceil(axis.tickSize / 300000) * 300000;
                    }
                }

                // Align first tick to tickSize intervals
                var start = Math.ceil(axis.min / axis.tickSize) * axis.tickSize;
                var ticksArray = [];

                // Generate list of ticks
                for(var value = start; value < axis.max; value += axis.tickSize)
                {
                    ticksArray.push(value);
                }

                return ticksArray;
            };

            return _func;
        }
    };

    return FlotUtils;

});
