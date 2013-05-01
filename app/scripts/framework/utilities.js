define(
[
    "utilities/datetime/datetime",
    "utilities/units/units",
    "utilities/workout/workout",
    "utilities/conversion/conversion",
    "utilities/chartBuilder"
], function(
    datetime,
    units,
    workout,
    conversion,
    chartBuilder
    )
{
    return {
        datetime: datetime,
        units: units,
        workout: workout,
        conversion: conversion,
        chartBuilder: chartBuilder
    };
});