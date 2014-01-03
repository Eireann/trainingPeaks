define(
[
    "utilities/conversion/conversion",
    "utilities/units/labels",
    "hbs!templates/views/elevationCorrection/flotToolTip"
    ],
function(conversion, unitLabels, flotToolTipTemplate)
{
    return function(series, hoveredSeries, hoveredIndex)
    {
        var toolTipData =
        {
            series:
            [
                {
                    label: "Original",
                    value: conversion.formatUnitsValue("elevation", series[0].data[hoveredIndex][1]),
                    current: hoveredSeries === "Original" ? true : false
                },
                {
                    label: "Corrected",
                    value: series.length === 2 ? conversion.formatUnitsValue("elevation", series[1].data[hoveredIndex][1]) : "--",
                    current: hoveredSeries === "Corrected" ? true : false
                }
            ]
        };

        return flotToolTipTemplate(toolTipData);
    };
});