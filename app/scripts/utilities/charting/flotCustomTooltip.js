define(
[
    "underscore",
    "utilities/conversion/conversion",
    "utilities/units/labels",
    "hbs!templates/views/expando/flotToolTip",
    "hbs!templates/views/expando/flotScatterGraphToolTip"
],
function(_, conversion, unitLabels, flotToolTipTemplate, flotScatterGraphToolTipTemplate)
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

    var FlotToolTip =
    {
        shouldDisplayToolTipValue: function(seriesName, value)
        {
            if (_.contains(channelsThatDontDisplayIfZero, seriesName) && !value)
                return false;

            return true;
        },

        buildGraphToolTip: function(allDataSeries, enabledDataSeries, flotItem, workoutType, xAxisType)
        {
            var xAxisValue = flotItem.datapoint[0];
            var powerSeries = _.find(enabledDataSeries, function(s) { return s.label === "Power"; });
            var toolTipData =
            {
                xAxisValue: null,
                series: []
            };

            if (xAxisType === "time")
                toolTipData.xAxisValue = conversion.formatUnitsValue(xAxisType, xAxisValue);
            else
                toolTipData.xAxisValue = conversion.formatUnitsValue(xAxisType, xAxisValue, { defaultValue: undefined, workoutTypeId: workoutType }) + " " + unitLabels(xAxisType, workoutType);

            var toolTipSeries = this.formatYAxisData(allDataSeries, enabledDataSeries, workoutType, powerSeries, false, flotItem, "graph");

            _.each(flexChannelOrder, function(orderedChannel)
            {
                var series = _.find(toolTipSeries, function(s) { return s.label === orderedChannel; });
                if (series)
                {
                    toolTipData.series.push(series);
                }
            });

            return flotToolTipTemplate(toolTipData);
        },
        buildScatterGraphToolTip: function(allDataSeries, enabledDataSeries, flotItem, workoutType, xAxisType)
        {
            var hoveredSeriesName = flotItem.series.name;
            var hoveredIndex = flotItem.dataIndex;
            var xAxisValue = flotItem.datapoint[0];

            var powerSeries = _.find(allDataSeries, function(s) { return s.label === "Power"; });
            var hoveredSeries = _.find(enabledDataSeries, function(s) { return s.name === hoveredSeriesName; });
            var toolTipData =
            {
                title: "",
                x: {},
                y: {}
            };
            var toolTipSeries = [];
            var lowerCaseAxisName = xAxisType.toLowerCase();

            if(xAxisType === "PowerBalance" && powerSeries)
            {
                this.formatBalancedPower(allDataSeries, flotItem.series, powerSeries, toolTipSeries, flotItem, xAxisType, "scatter");
                if(!_.isEmpty(toolTipSeries))
                {
                    toolTipData.x.label = toolTipSeries[0].label;
                    toolTipData.x.value = toolTipSeries[0].value;
                    toolTipData.x.units = toolTipSeries[0].units;
                }
            }
            else
            {
                toolTipData.x.label = xAxisType;
                toolTipData.x.value = conversion.formatUnitsValue(lowerCaseAxisName, xAxisValue, { defaultValue: undefined, workoutTypeId: workoutType });
                toolTipData.x.units = unitLabels(lowerCaseAxisName, workoutType);
            }

            toolTipSeries = this.formatYAxisData(allDataSeries, [hoveredSeries], workoutType, powerSeries, true, flotItem, "scatter");

            toolTipData.y.label = toolTipSeries[0].label;
            toolTipData.y.value = toolTipSeries[0].value;
            toolTipData.y.units = toolTipSeries[0].units;

            if(hoveredSeriesName === "averageSeries")
            {
                toolTipData.title = "Average";
                var rightPowerPercentage;
                var leftPowerPercentage;

                if(xAxisType === "PowerBalance" && powerSeries)
                {
                    leftPowerPercentage = (100 - xAxisValue * 100).toFixed(1);
                    rightPowerPercentage = (xAxisValue * 100).toFixed(1);
                    toolTipData.x.value = leftPowerPercentage + "% / " + rightPowerPercentage + "%";
                    toolTipData.x.units = "";
                }
                if(hoveredSeries.label === "PowerBalance" && powerSeries)
                {
                    leftPowerPercentage = (100 - hoveredSeries.data[hoveredIndex][1] * 100).toFixed(1);
                    rightPowerPercentage = (hoveredSeries.data[hoveredIndex][1] * 100).toFixed(1);
                    toolTipData.y.value = leftPowerPercentage + "% / " + rightPowerPercentage + "%";
                    toolTipData.y.units = "";
                }
            }

            return flotScatterGraphToolTipTemplate(toolTipData);
        },

        formatYAxisData: function(allDataSeries, enabledDataSeries, workoutType, powerSeries, alwaysDisplay, flotItem, graphType)
        {
            var toolTipSeries = [];

            _.each(enabledDataSeries, function(s)
            {
                var value = s.data[flotItem.dataIndex][1];
                //TODO: probably should drop data points that meet the criteria below in !shouldDisplayToolTipValue
                if (!alwaysDisplay && !this.shouldDisplayToolTipValue(s.label, value))
                    return;

                if(powerSeries && (s.label === "RightPower" || s.label === "PowerBalance"))
                    this.formatBalancedPower(allDataSeries, s, powerSeries, toolTipSeries, flotItem, null, graphType);

                //TODO Refactor: assuming the proper conversion field name is simply the lower-cased series name
                //TODO is wrong. Should probably add a field to the series object in the data parser.
                var dataType = s.label === "RightPower" ? "power" : s.label.toLowerCase();
                var config =
                {
                    label: s.label,
                    value: conversion.formatUnitsValue(dataType, value, { defaultValue: undefined, workoutTypeId: workoutType }),
                    units: s.label === "PowerBalance" ? "" : unitLabels(dataType, workoutType)
                };

                if (s.label === flotItem.series.label)
                    config.current = true;

                if (s.label === "Power" && flotItem.series.label === "RightPower")
                    config.current = true;

                toolTipSeries.push(config);

                if (s.label === "Speed" && _.contains([1,3,12,13,100], workoutType))
                {
                    config =
                    {
                        label: "Pace",
                        value: conversion.formatUnitsValue("pace", value, { defaultValue: undefined, workoutTypeId: workoutType }),
                        units: unitLabels("pace", workoutType)
                    };

                    // Swim workouts use "pace" as their speed axis, even though the channelName remains "Speed" from the dataParser/API
                    // Mark this pace label as 'current' and remove 'current' from the speed label
                    if (s.label === flotItem.series.label && _.contains([1,3,12,13], workoutType))
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
            }, this);

            return toolTipSeries;
        },

        formatBalancedPower: function(allDataSeries, series, powerSeries, toolTipSeries, flotItem, xAxisType, graphType)
        {
            var rightPowerPercentage;
            var leftPowerPercentage;
            var rightPowerValue;
            var leftPowerValue;

            var index;

            if(series.label === "PowerBalance")
            {
                index = flotItem.series.label === "PowerBalance" ? 1 : 0;
                rightPowerValue = flotItem.datapoint[index] * 100;
                leftPowerValue = 100 - rightPowerValue;

                rightPowerPercentage = rightPowerValue.toFixed(1);
                leftPowerPercentage = leftPowerValue.toFixed(1);
            }

            if(graphType === "scatter" && (flotItem.series.label === "RightPower" || xAxisType === "RightPower"))
            {
                index = flotItem.series.label === "RightPower" ? 1 : 0;
                rightPowerValue = flotItem.datapoint[index];
                leftPowerValue = 100 - rightPowerValue;

                rightPowerPercentage = rightPowerValue.toFixed(1);
                leftPowerPercentage = leftPowerValue.toFixed(1);
            }

            if(graphType === "graph" && series.label === "RightPower")
            {
                var totalPowerValue = powerSeries.data[flotItem.dataIndex][1];
                rightPowerValue = series.data[flotItem.dataIndex][1];

                if (!totalPowerValue || !rightPowerValue)
                    return null;

                rightPowerPercentage = ((100 * rightPowerValue) / totalPowerValue).toFixed(1);
                leftPowerPercentage = (100 * (totalPowerValue - rightPowerValue) / totalPowerValue).toFixed(1);
            }

            toolTipSeries.push({
                label: "RightPower",
                value: +leftPowerPercentage + "% / " + rightPowerPercentage + "%",
                units: "",
                current: (flotItem.series.label === "Power" || flotItem.series.label === "RightPower")
            });
        }

    };

    return FlotToolTip;
});
