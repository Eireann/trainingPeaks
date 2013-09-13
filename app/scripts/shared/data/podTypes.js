define(
[
    "underscore"
],
function(
    _
         )
{

    var podTypes = [
        {
            podId: 1,
            podAccessString: "pod_meal_macronutrients_over_time"
        },
        {
            podId: 2,
            podAccessString: "pod_calories_difference_over_time"
        },
        {
            podId: 3,
            podAccessString: "pod_workout_summary_over_time"
        },
        {
            podId: 4,
            podAccessString: "pod_health_vault_sync"
        },
        {
            podId: 8,
            podAccessString: "pod_criticalPowerBests"
        },
        {
            podId: 10,
            podAccessString: "pod_WorkoutSummaryReportDuration"
        },
        {
            podId: 11,
            podAccessString: "pod_WorkoutSummaryReportDistance"
        },
        {
            podId: 12,
            podAccessString: "pod_RouteReporting"
        },
        {
            podId: 13,
            podAccessString: "pod_DailyMetricsReporting"
        },
        {
            podId: 14,
            podAccessString: "pod_ShoppingList"
        },
        {
            podId: 15,
            podAccessString: "pod_DashboardWelcome"
        },
        {
            podId: 16,
            podAccessString: "pod_RaceReports"
        },
        {
            podId: 17,
            podAccessString: "pod_TimeInHeartRateZonesByDate"
        },
        {
            podId: 18,
            podAccessString: "pod_TimeInHeartRateZonesByWeek"
        },
        {
            podId: 19,
            podAccessString: "pod_LongestWorkoutByWeekDistance"
        },
        {
            podId: 20,
            podAccessString: "pod_LongestWorkoutByWeekDuration"
        },
        {
            podId: 21,
            podAccessString: "pod_KilojoulesByWeek"
        },
        {
            podId: 22,
            podAccessString: "pod_MicronutrientReport"
        },
        {
            podId: 23,
            podAccessString: "pod_WorkoutSummaryReportTssIF"
        },
        {
            podId: 24,
            podAccessString: "pod_TimeInPowerZonesByDate"
        },
        {
            podId: 25,
            podAccessString: "pod_TimeInPowerZonesByWeek"
        },
        {
            podId: 26,
            podAccessString: "pod_TimeInSpeedZonesByDate"
        },
        {
            podId: 27,
            podAccessString: "pod_TimeInSpeedZonesByWeek"
        },
        {
            podId: 28,
            podAccessString: "pod_meanMaxHeartRateBests"
        },
        {
            podId: 29,
            podAccessString: "pod_meanMaxCadenceBests"
        },
        {
            podId: 30,
            podAccessString: "pod_meanMaxSpeedBests"
        },
        {
            podId: 31,
            podAccessString: "pod_meanMaxPaceBests"
        },
        {
            podId: 32,
            podAccessString: "pod_PerformanceManagerChart"
        },
        {
            podId: 33,
            podAccessString: "pod_PowerProfileChart"
        },
        {
            podId: 34,
            podAccessString: "pod_WeatherForecast"
        },
        {
            podId: 35,
            podAccessString: "pod_WKOSummary"
        },
        {
            podId: 36,
            podAccessString: "pod_meanMaxDistanceBests"
        }
    ];

    return {

        podTypes: podTypes,

        findById: function(podId)
        {
            var pod = _.find(podTypes, function(podType)
            {
                return podType.podId === podId;
            });

            if(!pod)
            {
                throw new Error("Invalid pod type id: " + podId);
            }

            return pod; 
        },
        
        findByAccessName: function(podAccessString)
        {
            var pod = _.find(podTypes, function(podType)
            {
                return podType.podAccessString === podAccessString;
            });

            if(!pod)
            {
                throw new Error("Invalid pod type access string: " + podAccessString);
            }

            return pod; 
        }
    };

});