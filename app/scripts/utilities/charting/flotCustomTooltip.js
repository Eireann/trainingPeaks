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

            if (s.label === "RightPower")
            {
                var totalPower = _.find(series, function (ps) { return ps.label === "Power"; });

                if (!totalPower)
                    return;

                totalPower = totalPower.data[hoveredIndex][1];

                if (!totalPower)
                    return;

                var rightPowerPercentage = (100 * value / totalPower).toFixed(1);
                var leftPowerPercentage = (100 * (totalPower - value) / totalPower).toFixed(1);
                
                toolTipData.series.push(
                {
                    label: "PowerBalance",
                    value: +leftPowerPercentage + "% / " + rightPowerPercentage + "%",
                    units: "",
                    current: (hoveredSeries === "Power" || hoveredSeries === "RightPower")
                });

                return;
            }

            //TODO Refactor: assuming the proper conversion field name is simply the lower-cased series name
            //TODO is wrong. Should probably add a field to the series object in the data parser.
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

            if (s.label === "Speed" && (workoutType === 1 || workoutType === 3 || workoutType === 13 || workoutType === 100))
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