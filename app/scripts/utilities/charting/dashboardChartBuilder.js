define(
[
    "views/dashboard/defaultChart",
    "views/dashboard/pmcChart"
],
function(
    DefaultChartView,
    PmcChartView
         )
{
    
    var chartConstructors = {
        32: PmcChartView
    };

    return {
        buildChartView: function(chartTypeId, options )
        {
            var ChartView = chartConstructors.hasOwnProperty(chartTypeId) ? chartConstructors[chartTypeId] : DefaultChartView;
            return new ChartView(options);
        }
    };

});