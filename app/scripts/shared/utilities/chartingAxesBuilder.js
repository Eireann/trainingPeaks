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

            if(axes.length > 1)
            {
                axes[1].position = "right";
                _.each(axes.slice(1), function(axes)
                {
                    axes.color = axes.color || "transparent";
                });
            }

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
