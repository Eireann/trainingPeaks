define(
[
    "underscore",
    "./dashboardChartBase",
    "TP",
    "utilities/charting/flotOptions",
    "models/reporting/fitnessSummaryModel",
    "hbs!templates/views/dashboard/dashboardChart"
],
function(
    _,
    DashboardChartBase,
    TP,
    defaultFlotOptions,
    FitnessSummaryModel,
    defaultChartTemplate
    )
{
    var FitnessSummaryChart = {

        className: DashboardChartBase.className + " fitnessSummaryChart",
        modelClass: FitnessSummaryModel,
        
        template:
        {
            type: "handlebars",
            template: defaultChartTemplate
        },

        // TODO: remove this when we're actually ready to request data
        fetchData: function()
        {
            this.waitingOff();
            this.render();
        },

        setupViewModel: function(options)
        {
            this.model = new TP.Model({
                title: options.title
            });
        },

        buildFlotPoints: function()
        {
            var chartPoints = [
                [0, 50],
                [1, 100],
                [2, 25]
            ];

            /*
                { label: "Run", data: 50, color: '#123456' },
                { label: "bike", data: 100, color: '#654321' },
                { label: "swim", data: 25, color: '#321654' }
            */

            return chartPoints;
        },

        buildFlotDataSeries: function (chartPoints)
        {
            var dataSeries =
            {
                data: chartPoints,
                pie:
                {
                    show: true
                }
            };

            return [dataSeries];
        },

        buildFlotChartOptions: function()
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions(null);

            // pie plugin wants series settings here in addition to in data series
            flotOptions.series = {
                pie: 
                {
                    show: true
                }
            };

            return flotOptions;
        }

    };

    return TP.ItemView.extend(_.extend({}, DashboardChartBase, FitnessSummaryChart));

});
