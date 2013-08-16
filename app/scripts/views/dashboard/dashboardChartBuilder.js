define(
[
    "TP",
    "views/dashboard/defaultChart",
    "views/dashboard/pmcChart",
    "dashboard/views/dashboardPodView",
    "dashboard/charts/fitnessSummaryChart"
],
function(
    TP,
    DefaultChartView,
    PmcChartView,
    DashboardPodView,
    FitnessSummaryChart
)
{
    
    var chartViewConstructors = {
        32: PmcChartView,
        3: DashboardPodView
    };

    var chartModelConstructors = {
        3: FitnessSummaryChart
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