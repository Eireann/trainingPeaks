define(
[
    "utilities/workout/workoutTypes",
    "utilities/workout/determineCompletedWorkout",
    "utilities/workout/fileReader",
    "utilities/workout/layoutFormatter",
    "utilities/workout/getKeyStatField",
    "utilities/workout/formatKeyStat",
    "utilities/workout/formatKeyStatUnits"
], function(
    workoutTypes,
    determineCompletedWorkout,
    workoutFileReader,
    workoutLayoutFormatter,
    getKeyStatField,
    formatKeyStat,
    formatKeyStatUnits
    )
{
    return {
        types: workoutTypes,
        determineCompletedWorkout: determineCompletedWorkout,
        FileReader: workoutFileReader,
        layoutFormatter: workoutLayoutFormatter,

        keyStat: {
            getField: getKeyStatField,
            formatStats: formatKeyStat,
            formatUnits: formatKeyStatUnits
        }

    };
});