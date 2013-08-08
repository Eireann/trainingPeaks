define(
[
    "underscore",
    "./dashboardChartBase",
    "TP",
    "utilities/charting/flotOptions",
    "utilities/charting/jquery.flot.pie",
    "models/reporting/fitnessSummaryModel",
    "hbs!templates/views/dashboard/dashboardChart"
],
function(
    _,
    DashboardChartBase,
    TP,
    defaultFlotOptions,
    flotPie,
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
                { label: "Run", data: 27, color: '#123456' },
                { label: "bike", data: 42, color: '#654321' },
                { label: "swim", data: 31, color: '#321654' }
            ];

            return chartPoints;
        },

        buildFlotDataSeries: function (chartPoints)
        {
            // pie charts are different than other charts in how we structure the series data
            return chartPoints;
        },

        buildFlotChartOptions: function()
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions(null);

            // pie plugin wants series settings here instead of in data series
            flotOptions.series = {
                pie: 
                {
                    show: true,
                    layerSlices: true,
                    startAngle: 0.
                }
            };

            return flotOptions;
        }

    };

    return TP.ItemView.extend(_.extend({}, DashboardChartBase, FitnessSummaryChart));

});
