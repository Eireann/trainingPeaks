define(
[
    "utilities/workout/workoutTypes",
    "utilities/workout/determineCompletedWorkout",
    "utilities/workout/fileReader"
], function(
    workoutTypes,
    determineCompletedWorkout,
    workoutFileReader
    )
{
    return {
        types: workoutTypes,
        determineCompletedWorkout: determineCompletedWorkout,
        FileReader: workoutFileReader
    };
});