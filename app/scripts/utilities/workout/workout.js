define(
[
    "utilities/workout/workoutTypes",
    "utilities/workout/determineCompletedWorkout"
], function(
    workoutTypes,
    determineCompletedWorkout
    )
{
    return {
        types: workoutTypes,
        determineCompletedWorkout: determineCompletedWorkout
    };
});