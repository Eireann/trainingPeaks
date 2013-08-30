define([
    "TP"
],
function(
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
                if(series.yaxisInfo)
                {
                    axes.push(series.yaxisInfo);
                    series.yaxis = axes.length;
                }
                else if(series.units)
                {
                    if(!axesIndexByUnits[series.units])
                    {
                        axes.push(ChartingAxesBuilder.makeAxisForUnits(series.units, options));
                        axesIndexByUnits[series.units] = axes.length;
                    }

                    series.yaxis = axesIndexByUnits[series.units];
                }
                else
                {
                    axes.push({});
                    series.yaxis = axes.length;
                }
            });

            if(axes.length > 1)
            {
                axes[1].position = "right";
            }

            return axes;
        },

        makeAxisForUnits: function(units, options)
        {
            return {
                label: TP.utils.units.getUnitsLabel(units),
                tickFormatter: function(value)
                {
                    return TP.utils.conversion.formatUnitsValue(units, value, options);
                }
            };
        }
    };

    return ChartingAxesBuilder;
});
