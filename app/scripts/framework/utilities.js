define(
[
    "utilities/datetime/datetime",
    "utilities/units/units",
    "utilities/workout/workout",
    "utilities/conversion/conversion"
], function(
    datetime,
    units,
    workout,
    conversion
    )
{
    return {
        datetime: datetime,
        units: units,
        workout: workout,
        conversion: conversion
    };
});