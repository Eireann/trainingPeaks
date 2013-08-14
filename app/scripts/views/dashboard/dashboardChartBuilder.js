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

            if(!options.dataManager)
            {
                if(theMarsApp && theMarsApp.dataManagers && theMarsApp.dataManagers.reporting)
                {
                    // TODO: don't directly reference this data manager from here, inject it
                    options.dataManager = theMarsApp.dataManagers.reporting;
                }
            }

            return new ChartView(options);
        }
    };

});