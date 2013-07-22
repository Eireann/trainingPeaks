define(
[
    "utilities/datetime/datetime",
    "utilities/units/units",
    "utilities/workout/workout",
    "utilities/conversion/conversion",
    "utilities/chartBuilder",
    "utilities/filesystem",
    "utilities/athlete/athlete",
    "utilities/trainingPlan/trainingPlan"
], function(
    datetime,
    units,
    workout,
    conversion,
    chartBuilder,
    filesystem,
    athlete,
    trainingPlan
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
        trainingPlan: trainingPlan,

        translate: function(textToTranslate)
        {
            return textToTranslate;
        }

    };
});