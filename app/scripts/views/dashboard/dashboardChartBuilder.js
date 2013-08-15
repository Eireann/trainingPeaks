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
        buildChartView: function(options)
        {
            var chartTypeId = options.model.get("chartType");
            var ChartView = chartConstructors.hasOwnProperty(chartTypeId) ? chartConstructors[chartTypeId] : DefaultChartView;
            return new ChartView(options);
        }
    };

});