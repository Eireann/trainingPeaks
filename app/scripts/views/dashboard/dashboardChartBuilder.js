define(
[
    "TP",
    "views/dashboard/pmcChart",
    "dashboard/views/dashboardPodView",
    "dashboard/charts/fitnessSummaryChart",
    "dashboard/charts/timeInZonesChart",
    "dashboard/charts/peaksChart"
],
function(
    TP,
    PmcChartView,
    DashboardPodView,
    FitnessSummaryChart,
    TimeInZonesChart,
    PeaksChart
)
{

    // Defaults to DashboardPodView
    var chartViewConstructors = {
        32: PmcChartView
    };

    // Defaults to TP.Model
    var chartModelConstructors = {
        3: FitnessSummaryChart,
        17: TimeInZonesChart,
        24: TimeInZonesChart,
        26: TimeInZonesChart
        8: PeaksChart,
        28: PeaksChart,
        29: PeaksChart,
        30: PeaksChart,
        31: PeaksChart,
        36: PeaksChart
    };

    return {
        buildChartView: function(options)
        {
            var chartTypeId = options.model.get("chartType");
            var ChartView = chartViewConstructors.hasOwnProperty(chartTypeId) ? chartViewConstructors[chartTypeId] : DashboardPodView;
            return new ChartView(options);
        },

        buildChartModel: function(attributes, options)
        {
            var chartTypeId = attributes.chartType;
            var Model = chartModelConstructors.hasOwnProperty(chartTypeId) ? chartModelConstructors[chartTypeId] : TP.Model;
            return new Model(attributes, options); 
        }
    };

});
