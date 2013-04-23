define(
[
    "utilities/datetime/datetime",
    "utilities/units/units",
    "utilities/workout/workout"
], function(
    datetime,
    units,
    workout
    )
{
    return {
        datetime: datetime,
        units: units,
        workout: workout
    };
});