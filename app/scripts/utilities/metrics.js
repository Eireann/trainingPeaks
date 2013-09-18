define(
[
    "underscore",
    "shared/data/metricTypes",
    "utilities/conversion/conversion",
    "utilities/units/units"
],
function(
    _,
    metricTypes,
    conversionUtils,
    unitsUtils
)
{

    var metricTypeById = {};

    _.each(metricTypes, function(metricType) {
        metricTypeById[metricType.id] = metricType;
    });

    var metricsUtils = 
    {

        infoFor: function(details)
        {
            var info = metricTypeById[details.type];
            if(info.subMetrics && details.index)
            {
                var subInfo = _.find(info.subMetrics, function(subMetric)
                {
                    return subMetric.index == details.index;
                });

                _.extend(info, subInfo);
            }

            return info;
        },

        labelFor: function(details)
        {
            return metricsUtils.infoFor(details).label;
        },

        formatValueFor: function(details, options)
        {
            var info = metricsUtils.infoFor(details);
            var value = details.value;

            if (info.enumeration)
            {
                var option = _.find(info.enumeration, function(option)
                {
                    return option.value === value;
                });

                return option && option.label;
            }
            else if(info.units)
            {
                var formattedValue = conversionUtils.formatUnitsValue(info.units, value);
                if(options && options.displayUnits)
                {
                    formattedValue += " " + unitsUtils.getUnitsLabel(info.units);
                }
                return formattedValue;
            }
            else
            {
                return value;
            }
        }

    };

    return metricsUtils;

});

