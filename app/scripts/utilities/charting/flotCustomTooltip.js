define(
[
    "utilities/datetime/format",
    "utilities/conversion/convertToViewUnits",
    "utilities/units/labels",
    "hbs!templates/views/quickView/expandedView/flotToolTip"
    ],
function(formatDateTime, convertToViewUnits, unitLabels, flotToolTipTemplate)
{
    return function(series, hoveredSeries, hoveredIndex, timeOffset)
    {
        var toolTipData =
        {
            timeOffset: null,
            series: []
        };

        toolTipData.timeOffset = formatDateTime.decimalSecondsAsTime(timeOffset / 1000);
        _.each(series, function(s)
        {
            var value = s.data[hoveredIndex][1];

            //TODO Refactor!
            var fieldName = s.label.toLowerCase();
            var config =
            {
                label: s.label,
                value: convertToViewUnits(value, fieldName),
                units: unitLabels(fieldName)
            };

            if (s.label === hoveredSeries)
                config.current = true;

            toolTipData.series.push(config);
        });

        return flotToolTipTemplate(toolTipData);
    };
});