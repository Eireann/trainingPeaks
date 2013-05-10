define(
[
    "utilities/datetime/datetime",
    "utilities/units/units",
    "utilities/workout/workout",
    "utilities/conversion/conversion",
    "utilities/chartBuilder",
    "utilities/filesystem"
], function(
    datetime,
    units,
    workout,
    conversion,
    chartBuilder,
    filesystem
    )
{
    return {
        datetime: datetime,
        units: units,
        workout: workout,
        conversion: conversion,
        chartBuilder: chartBuilder,
        filesystem: filesystem
    };
});