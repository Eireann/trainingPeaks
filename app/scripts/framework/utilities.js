define(
[
    "utilities/datetime/datetime",
    "utilities/units/units",
    "utilities/workoutTypes"
], function(
    datetime,
    units,
    workoutTypes
    )
{
    return {
        datetime: datetime,
        units: units,
        workoutTypes: workoutTypes
    };
});