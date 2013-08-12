define(
[
    "views/dashboard/defaultChart",
    "views/dashboard/pmcChart",
    "views/dashboard/fitnessSummaryChart"
],
function(
    DefaultChartView,
    PmcChartView,
    FitnessSummaryChart
         )
{
    
    var chartConstructors = {
        32: PmcChartView,
        3: FitnessSummaryChart
    };

    return {
        buildChartView: function(chartTypeId, options )
        {
            var ChartView = chartConstructors.hasOwnProperty(chartTypeId) ? chartConstructors[chartTypeId] : DefaultChartView;
            options.dataManager = theMarsApp.dataManagers.reporting;
            return new ChartView(options);
        }
    };

});