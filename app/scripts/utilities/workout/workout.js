define(
[
    "underscore",
    "utilities/workout/workoutTypes",
    "utilities/workout/determineCompletedWorkout",
    "utilities/workout/fileReader",
    "utilities/workout/layoutFormatter",
    "utilities/workout/getKeyStatField",
    "utilities/workout/formatKeyStat",
    "utilities/workout/formatKeyStatUnits",
    "utilities/workout/formatPeakTime",
    "utilities/workout/formatPeakDistance",
    "utilities/workout/formatExerciseValue"
], function(
    _,
    workoutTypes,
    determineCompletedWorkout,
    workoutFileReader,
    workoutLayoutFormatter,
    getKeyStatField,
    formatKeyStat,
    formatKeyStatUnits,
    formatPeakTime,
    formatPeakDistance,
    formatExerciseValue
    )
{
    return {
        types: workoutTypes,
        determineCompletedWorkout: determineCompletedWorkout,
        FileReader: workoutFileReader,
        layoutFormatter: workoutLayoutFormatter,
        formatPeakTime: formatPeakTime,
        formatPeakDistance: formatPeakDistance,
        formatExerciseValue: formatExerciseValue,

        keyStat: {
            getField: getKeyStatField,
            formatStats: formatKeyStat,
            formatUnits: formatKeyStatUnits
        },

        getComplianceCssClassName: function(workout)
        {
            if(workout.has("totalTimePlanned"))
            {

                var plannedSeconds = workout.get("totalTimePlanned") * 3600;
                var completedSeconds = workout.get("totalTime") * 3600;
                var ratio = completedSeconds / plannedSeconds;

                if(plannedSeconds === 0 && completedSeconds === 0)
                {
                    return "ComplianceNone";
                }
                else if(ratio >= 0.8 && ratio <= 1.2)
                {
                    return "ComplianceGreen";
                }
                else if(ratio >= 0.5 && ratio <= 1.5)
                {
                    return "ComplianceYellow";
                }
                else
                {
                    return "ComplianceRed";
                }
            }

            // default if no time planned
            return "ComplianceNone";
        },

        formatWorkoutTypes: function(workoutTypeIds)
        {
            var workoutTypeNames = [];

            if (!workoutTypeIds || !workoutTypeIds.length || workoutTypeIds.length === _.keys(workoutTypes.typesById).length)
            {
                workoutTypeNames.push("All");
            } else
            {
                _.each(workoutTypeIds, function(item, index)
                {
                    var intItem = parseInt(item, 10);
                    var workoutType = intItem === 0 ? "All" : workoutTypes.getNameById(intItem);
                    if(workoutType !== "Unknown")
                    {
                        workoutTypeNames.push(workoutType); 
                    }

                }, this);
            }

            var types = workoutTypeNames.join(", ");
            if (!types)
            {
                types = "All";
            }
            return types;
        }

    };
});
