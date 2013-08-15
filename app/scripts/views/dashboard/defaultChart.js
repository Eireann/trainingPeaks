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

        className: DashboardChartBase.className + " defaultChart",
        
        template:
        {
            type: "handlebars",
            template: defaultChartTemplate
        },

        buildFlotPoints: function(timeInZones)
        {
            var chartPoints = [
                [0, 5],
                [1, 4],
                [2, 3],
                [3, 2],
                [4, 2],
                [5, 3],
                [6, 4],
                [7, 5]
            ];

            return chartPoints;
        },

        buildFlotDataSeries: function (chartPoints, chartColors)
        {
            var chartColor = chartColors.gradients.pace;
            var dataSeries =
            {
                data: chartPoints,
                bars:
                {
                    show: true,
                    lineWidth: 0,
                    fill: true,
                    fillColor: { colors: [chartColor.light, chartColor.dark] }
                },
                highlightColor: chartColor.light
            };

            return [dataSeries];
        },

        buildFlotChartOptions: function()
        {
            var flotOptions = defaultFlotOptions.getBarOptions(this.onHover);

            flotOptions.yaxis = {
                tickDecimals: 0
            };

            flotOptions.xaxis = {
                color: "transparent"
            };

            return flotOptions;
        },

        fetchData: function()
        {
            this.waitingOff();
            this.render();
        },

        getChartTitle: function()
        {
            return this.model.get("title");
        }
    };

    return TP.ItemView.extend(_.extend({}, DashboardChartBase, DefaultChart));

});
