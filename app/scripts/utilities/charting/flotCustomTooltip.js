define(
[
    "utilities/datetime/format",
    "utilities/conversion/conversion",
    "utilities/units/labels",
    "hbs!templates/views/expando/flotToolTip"
],
function(formatDateTime, conversion, unitLabels, flotToolTipTemplate)
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
            return false;

        return true;
    };

    var getSeriesWithAppropriatePowerOptions = function(allDataSeries, enabledDataSeries)
    {
        // make sure right power is available if power is available
        enabledDataSeries = enabledDataSeries.slice();
        var powerSeriesEnabled = _.find(enabledDataSeries, function(s) { return s.label === "Power"; });
        var rightPowerSeriesEnabled = _.find(enabledDataSeries, function(s) { return s.label === "RightPower"; });

        if(powerSeriesEnabled && !rightPowerSeriesEnabled)
        {
            var rightPowerSeries = _.find(allDataSeries, function(s) { return s.label === "RightPower"; });            
            if(rightPowerSeries)
            {
                enabledDataSeries.push(rightPowerSeries);
            }
        }

        if(rightPowerSeriesEnabled && !powerSeriesEnabled)
        {
            var powerSeries = _.find(allDataSeries, function(s) { return s.label === "Power"; });            
            if(powerSeries)
            {
                enabledDataSeries.push(powerSeries);
            }
        }

        return enabledDataSeries;
    };

    return function(allDataSeries, enabledDataSeries, hoveredSeriesName, hoveredIndex, xAxisOffset, workoutType, axisType)
    {

        enabledDataSeries = getSeriesWithAppropriatePowerOptions(allDataSeries, enabledDataSeries);

        var toolTipData =
        {
            xAxisOffset: null,
            series: []
        };

        if (axisType === "distance")
            toolTipData.xAxisOffset = conversion.formatUnitsValue("distance", xAxisOffset, { defaultValue: undefined, workoutTypeId: workoutType }) + " " + unitLabels("distance", workoutType);
        else
            toolTipData.xAxisOffset = formatDateTime.decimalSecondsAsTime(xAxisOffset / 1000);

        var toolTipSeries = [];

        _.each(enabledDataSeries, function(s)
        {
            var value = s.data[hoveredIndex][1];

            if (!shouldDisplayTooltipValue(s.label, value))
                return;

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
                value: conversion.formatUnitsValue(fieldName, value, { defaultValue: undefined, workoutTypeId: workoutType }),
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
                    value: conversion.formatUnitsValue("pace", value, { defaultValue: undefined, workoutTypeId: workoutType }),
                    units: unitLabels("pace", workoutType)
                };

                // Swim workouts use "pace" as their speed axis, even though the channelName remains "Speed" from the dataParser/API
                // Mark this pace label as 'current' and remove 'current' from the speed label
                if (s.label === hoveredSeriesName && workoutType === 1)
                {
                    config.current = true;
                    _.each(toolTipSeries, function(config)
                    {
                        if (config.label === "Speed")
                        {
                            config.current = false;
                        }
                    });      
                }
                    

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