define(
[
    "TP",
    "views/dashboard/defaultChart",
    "views/dashboard/pmcChart",
    "dashboard/views/dashboardPodView",
    "dashboard/charts/fitnessSummaryChart",
    "dashboard/charts/peaksChart"
],
function(
    TP,
    DefaultChartView,
    PmcChartView,
    DashboardPodView,
    FitnessSummaryChart,
    PeaksChart
)
{

    var chartViewConstructors = {
        3: DashboardPodView,
        8: DashboardPodView,
        28: DashboardPodView,
        29: DashboardPodView,
        30: DashboardPodView,
        31: DashboardPodView,
        32: PmcChartView,
        36: DashboardPodView
    };

    var chartModelConstructors = {
        3: FitnessSummaryChart,
        8: PeaksChart,
        28: PeaksChart,
        29: PeaksChart,
        30: PeaksChart,
        31: PeaksChart,
        36: PeaksChart,
    };

    return {
        buildChartView: function(options)
        {
            var chartTypeId = options.model.get("chartType");
            var ChartView = chartViewConstructors.hasOwnProperty(chartTypeId) ? chartViewConstructors[chartTypeId] : DefaultChartView;
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
