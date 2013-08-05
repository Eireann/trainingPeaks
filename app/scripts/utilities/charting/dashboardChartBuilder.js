define(
[
    "views/dashboard/pmcChart"
],
function(
    PmcChartView
         )
{
    
    var chartConstructors = {
        32: PmcChartView
    };

    return {
        buildChartView: function(chartTypeId, podIndex )
        {
            if(!chartConstructors.hasOwnProperty(chartTypeId))
            {
                throw "Invalid dashboard chart type id: " + chartTypeId;
            }
            return new chartConstructors[chartTypeId]({ podIndex: podIndex});
        }
    }

});