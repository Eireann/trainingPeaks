define(
[
    "underscore"
],
function(
    _
         )
{

    // Dashboard pods start at 1
    // Expando pods start at id 100
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
        },
        {
            podId: 37,
            podAccessString: "pod_WorkoutSummaryReportElevation"
        },
        {
            podId: 100,
            podAccessString: "wo_summary"
        },
        {
            podId: 101,
            podAccessString: "wo_PowerByZones"
        },
        {
            podId: 102,
            podAccessString: "wo_HeartRateByZones"
        },
        {
            podId: 104,
            podAccessString: "wo_CriticalPower"
        },
        {
            podId: 107,
            podAccessString: "wo_HeartRateByBins"
        },
        {
            // laps and splits table view
            podId: 108,
            podAccessString: "pod_lapsAndSplits"
        },
        {
            // laps and splits column chart
            podId: 1081,
            podAccessString: "pod_lapsAndSplits"
        },
        {
            podId: 109,
            podAccessString: "pod_equipment"
        },
        {
            podId: 110,
            podAccessString: "pod_powerByBins"
        },
        {
            podId: 111,
            podAccessString: "pod_meanMaxPower"
        },
        {
            podId: 114,
            podAccessString: "pod_WorkoutExtensions"
        },
        {
            podId: 115,
            podAccessString: "pod_SpeedBins"
        },
        {
            podId: 116,
            podAccessString: "pod_PaceBins"
        },
        {
            podId: 117,
            podAccessString: "pod_CadenceBins"
        },
        {
            podId: 118,
            podAccessString: "pod_meanMaxHR"
        },
        {
            podId: 119,
            podAccessString: "pod_meanMaxSpeed"
        },
        {
            podId: 120,
            podAccessString: "pod_meanMaxPace"
        },
        {
            podId: 121,
            podAccessString: "pod_meanMaxCadence"
        },
        {
            podId: 122,
            podAccessString: "pod_SpeedByZones"
        },
        {
            podId: 123,
            podAccessString: "pod_PaceByZones"
        },
        {
            podId: 125,
            podAccessString: "pod_meanMaxDistance"
        },
        {
            podId: 150,
            podAccessString: "journal_GroundControl"
        },
        {
            podId: 151,
            podAccessString: "journal_layoutTiled"
        },
        {
            podId: 152,
            podAccessString: "view_Graph",
            defaults: {
                ViewPod: true,
                UsePod: true
            }
        },
        {
            podId: 153,
            podAccessString: "view_Map",
            defaults: {
                ViewPod: true,
                UsePod: true
            }
        },
        {
            podId: 154,
            podAccessString: "view_Ranges"
        },
        {
            podId: 155,
            podAccessString: "view_Route",
            defaults: {
                ViewPod: true,
                UsePod: true
            }
        },
        {
            podId: 156,
            podAccessString: "view_ScatterPlot"
        },
        {
            podId: 157,
            podAccessString: "view_DataGrid"
        },
        {
            podId: 158,
            podAccessString: "view_QuadrantAnalysis"
        },
        {
            podId: 159,
            podAccessString: "expando_DataEditing"
        },
        {
            podId: 1020,
            podAccessString: "qv_TimeInHeartRateZones"          
        },
        {
            podId: 1010,
            podAccessString: "qv_TimeInPowerZones"
        },
        {
            podId: 1220,
            podAccessString: "qv_TimeInSpeedZones"
        },
        {
            podId: 1180,
            podAccessString: "qv_MeanMaxHeartRate"          
        },
        {
            podId: 1110,
            podAccessString: "qv_MeanMaxPower"
        },
        {
            podId: 1190,
            podAccessString: "qv_MeanMaxSpeed"
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
        },

        getDefaultValue: function(podType, key)
        {
            if(podType && podType.defaults && podType.defaults.hasOwnProperty(key))
            {
                return podType.defaults[key]; 
            }
            else
            {
                return false;
            }
        }
    };

});