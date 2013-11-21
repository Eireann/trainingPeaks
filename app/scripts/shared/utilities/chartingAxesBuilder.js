define([
    "underscore",
    "TP"
],
function(
    _,
    TP
)
{
    var ChartingAxesBuilder =  {
        makeYaxes: function(series, options)
        {
            options = _.extend({ maxRight: 1 }, options);
            var axes = [];
            var axesIndexByUnits = {};

            _.each(series, function(series)
            {
                if(!series.yaxis)
                {
                    if(series.yaxisInfo)
                    {
                        axes.push(series.yaxisInfo);
                        series.yaxis = axes.length;
                    }
                    else if(series.units)
                    {
                        if(!axesIndexByUnits[series.units])
                        {
                            axes.push(ChartingAxesBuilder.makeAxisForUnits(series.units, options, series.yaxisExtraInfo));
                            axesIndexByUnits[series.units] = axes.length;
                        }

                        series.yaxis = axesIndexByUnits[series.units];
                    }
                    else
                    {
                        axes.push({
                            min: options.min
                        });
                        series.yaxis = axes.length;
                    }
                }
            });

            _.each(axes, function(axis, index)
            {
                if(index % 2 === 1 && index / 2 < options.maxRight)
                {
                    axis.position = "right";
                }
            });

            _.each(axes.slice(1), function(axes)
            {
                axes.color = axes.color || "transparent";
            });

            return axes;
        },

        makeAxisForUnits: function(units, options, extraInfo)
        {
            var axis =
            {
                label: TP.utils.units.getUnitsLabel(units, options.workoutTypeId),
                tickFormatter: function(value)
                {
                    return TP.utils.conversion.formatUnitsValue(units, value, options);
                },
                min: options.min
            };

            _.extend(axis, extraInfo);

            return axis;
        }
    };

    return ChartingAxesBuilder;
});
