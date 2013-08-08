define(
[
    "underscore",
    "./dashboardChartBase",
    "TP",
    "utilities/charting/flotOptions",
    "hbs!templates/views/dashboard/dashboardChart"
],
function(
    _,
    DashboardChartBase,
    TP,
    defaultFlotOptions,
    defaultChartTemplate
    )
{
    var DefaultChart = {

        template:
        {
            type: "handlebars",
            template: defaultChartTemplate
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
                [{ label: "Run", data: 50, color: '#123456' }],
                [{ label: "bike", data: 100, color: '#654321' }],
                [{ label: "swim", data: 25, color: '#321654' }]
            ];

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
    };

    return TP.ItemView.extend(_.extend({}, DashboardChartBase, DefaultChart));

});
