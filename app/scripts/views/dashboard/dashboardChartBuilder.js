define(
[
    "TP",
    "framework/chart",
    "dashboard/views/dashboardPodView",
    "dashboard/charts/pmcChart",
    "dashboard/charts/fitnessSummaryChart",
    "dashboard/charts/peaksChart",
    "dashboard/charts/timeInZonesChart",
    "dashboard/charts/timeInZonesByWeekChart",
    "dashboard/charts/metricsChart",
    "dashboard/charts/workoutSummaryChart",
    "dashboard/charts/fitnessHistoryChart"
],
function(
    TP,
    Chart,
    DashboardPodView,
    PmcChart,
    FitnessSummaryChart,
    PeaksChart,
    TimeInZonesChart,
    TimeInZonesByWeekChart,
    MetricsChart,
    WorkoutSummaryChart,
    FitnessHistoryChart
)
{
    // Defaults to TP.Model
    var chartModelConstructors =
    {
        35: FitnessHistoryChart,
        32: PmcChart,
        3: FitnessSummaryChart,
        8: PeaksChart,
        28: PeaksChart,
        29: PeaksChart,
        30: PeaksChart,
        31: PeaksChart,
        36: PeaksChart,
        17: TimeInZonesChart,
        24: TimeInZonesChart,
        26: TimeInZonesChart,
        18: TimeInZonesByWeekChart,
        25: TimeInZonesByWeekChart,
        27: TimeInZonesByWeekChart,
        13: MetricsChart,
        10: WorkoutSummaryChart,
        11: WorkoutSummaryChart,
        21: WorkoutSummaryChart,
        23: WorkoutSummaryChart,
        37: WorkoutSummaryChart,
        19: WorkoutSummaryChart,
        20: WorkoutSummaryChart
    };

    return {
        buildChartView: function(options)
        {
            return new DashboardPodView(options);
        },

        buildChartModel: function(attributes, options)
        {
            var chartTypeId = attributes.chartType;
            var Model = chartModelConstructors.hasOwnProperty(chartTypeId) ? chartModelConstructors[chartTypeId] : Chart;
            return new Model(attributes, options); 
        }
    };

});
