define(
[
    "utilities/workout/workoutTypes",
    "utilities/workout/determineCompletedWorkout",
    "utilities/workout/fileReader",
    "utilities/workout/layoutFormatter",
    "utilities/workout/getKeyStatField",
    "utilities/workout/formatKeyStat",
    "utilities/workout/formatKeyStatUnits",
    "utilities/workout/formatPeakTime",
    "utilities/workout/formatPeakDistance"
], function(
    workoutTypes,
    determineCompletedWorkout,
    workoutFileReader,
    workoutLayoutFormatter,
    getKeyStatField,
    formatKeyStat,
    formatKeyStatUnits,
    formatPeakTime,
    formatPeakDistance
    )
{
    return {
        types: workoutTypes,
        determineCompletedWorkout: determineCompletedWorkout,
        FileReader: workoutFileReader,
        layoutFormatter: workoutLayoutFormatter,
        formatPeakTime: formatPeakTime,
        formatPeakDistance: formatPeakDistance,

        keyStat: {
            getField: getKeyStatField,
            formatStats: formatKeyStat,
            formatUnits: formatKeyStatUnits
        }

    };
});