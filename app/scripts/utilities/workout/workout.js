define(
[
    "utilities/workout/workoutTypes",
    "utilities/workout/determineCompletedWorkout",
    "utilities/workout/fileReader",
    "utilities/workout/layoutFormatter"
], function(
    workoutTypes,
    determineCompletedWorkout,
    workoutFileReader,
    workoutLayoutFormatter
    )
{
    return {
        types: workoutTypes,
        determineCompletedWorkout: determineCompletedWorkout,
        FileReader: workoutFileReader,
        layoutFormatter: workoutLayoutFormatter
    };
});