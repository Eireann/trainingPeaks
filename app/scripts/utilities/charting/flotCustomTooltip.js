define(
[
    "utilities/datetime/format",
    "utilities/conversion/convertToViewUnits",
    "utilities/units/labels",
    "hbs!templates/views/expando/flotToolTip"
],
function(formatDateTime, convertToViewUnits, unitLabels, flotToolTipTemplate)
{
    var flexChannelOrder =
    [
        "Cadence",
        "HeartRate",
        "Elevation",
        "Power",
        "RightPower",
        "Speed",
        "Pace",
        "Torque",
        "Temperature"
    ];

    var channelsThatDontDisplayIfZero = [
        "Cadence",
        "HeartRate",
        "Power",
        "RightPower",
        "Speed",
        "Pace",
        "Torque"
    ];

    var shouldDisplayTooltipValue = function(seriesName, value)
    {
        if (_.contains(channelsThatDontDisplayIfZero, seriesName) && !value)
        {
            return false;
        }

        return true;
    };

    return function(allDataSeries, enabledDataSeries, hoveredSeriesName, hoveredIndex, timeOffset, workoutType)
    {
        var toolTipData =
        {
            timeOffset: null,
            series: []
        };

        toolTipData.timeOffset = formatDateTime.decimalSecondsAsTime(timeOffset / 1000);

        var toolTipSeries = [];

        _.each(enabledDataSeries, function(s)
        {
            var value = s.data[hoveredIndex][1];

            if (!shouldDisplayTooltipValue(s.label, value))
            {
                return;
            }

            if (s.label === "RightPower")
            {
                var totalPower = _.find(allDataSeries, function (ps) { return ps.label === "Power"; });

                if (!totalPower)
                    return;

                totalPower = totalPower.data[hoveredIndex][1];

                if (!totalPower)
                    return;

                var rightPowerPercentage = (100 * value / totalPower).toFixed(1);
                var leftPowerPercentage = (100 * (totalPower - value) / totalPower).toFixed(1);

                toolTipSeries.push(
                {
                    label: "RightPower",
                    value: +leftPowerPercentage + "% / " + rightPowerPercentage + "%",
                    units: "",
                    current: (hoveredSeriesName === "Power" || hoveredSeriesName === "RightPower")
                });

                return;
            }

            //TODO Refactor: assuming the proper conversion field name is simply the lower-cased series name
            //TODO is wrong. Should probably add a field to the series object in the data parser.
            var fieldName = s.label.toLowerCase();
            var config =
            {
                label: s.label,
                value: convertToViewUnits(value, fieldName, undefined, workoutType),
                units: unitLabels(fieldName, workoutType)
            };

            if (s.label === hoveredSeriesName)
                config.current = true;

            if (s.label === "Power" && hoveredSeriesName === "RightPower")
                config.current = true;

            toolTipSeries.push(config);

            if (s.label === "Speed" && (workoutType === 1 || workoutType === 3 || workoutType === 13 || workoutType === 100))
            {
                config =
                {
                    label: "Pace",
                    value: convertToViewUnits(value, "pace", undefined, workoutType),
                    units: unitLabels("pace", workoutType)
                };

                if (s.label === hoveredSeriesName)
                    config.current = true;

                toolTipSeries.push(config);
            }
        });

        
        _.each(flexChannelOrder, function(orderedChannel)
        {
            var series = _.find(toolTipSeries, function(s) { return s.label === orderedChannel; });
            if (series)
            {
                toolTipData.series.push(series);
            }
        });

        return flotToolTipTemplate(toolTipData);
    };
});