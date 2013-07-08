define(
[
    "utilities/datetime/datetime",
    "utilities/units/units",
    "utilities/workout/workout",
    "utilities/conversion/conversion",
    "utilities/chartBuilder",
    "utilities/filesystem",
    "utilities/athlete/athlete"
], function(
    datetime,
    units,
    workout,
    conversion,
    chartBuilder,
    filesystem,
    athlete
    )
{
    return {
        datetime: datetime,
        units: units,
        workout: workout,
        conversion: conversion,
        chartBuilder: chartBuilder,
        filesystem: filesystem,
        athlete: athlete,

        translate: function(textToTranslate)
        {
            return textToTranslate;
        }

    };
});