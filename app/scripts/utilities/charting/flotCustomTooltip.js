define(
[
    "utilities/datetime/format",
    "utilities/conversion/convertToViewUnits",
    "utilities/units/labels",
    "hbs!templates/views/expando/flotToolTip"
    ],
function(formatDateTime, convertToViewUnits, unitLabels, flotToolTipTemplate)
{
    return function(series, hoveredSeries, hoveredIndex, timeOffset, workoutType)
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

            if (s.label === "Speed" && (workoutType === 1 || workoutType === 3 || workoutType === 13))
            {
                config =
                {
                    label: "Pace",
                    value: convertToViewUnits(value, "pace"),
                    units: unitLabels("pace")
                };

                if (s.label === hoveredSeries)
                    config.current = true;

                toolTipData.series.push(config);
            }
        });

        return flotToolTipTemplate(toolTipData);
    };
});