define(
[
    "setImmediate",
    "TP",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "hbs!templates/views/dashboard/dashboardChart"
],
function(
    setImmediate,
    TP,
    defaultFlotOptions,
    chartColors,
    dashboardChartTemplate
    )
{
    return TP.ItemView.extend({

        tagName: "div",
        className: "dashboardChart",

        template:
        {
            type: "handlebars",
            template: dashboardChartTemplate
        },

        initialize: function(options)
        {
            this.on("render", this.renderChartAfterRender, this);

            this.model = new TP.Model({
                title: "Chart Title",
                yaxisLabel: "Y Axis Label",
                xaxisLabel: "X Axis Label"
            });
        },

        ui: 
        {
            chartContainer: ".chartContainer"
        },

        renderChartAfterRender: function()
        {
            var self = this;
            setImmediate(function()
            {
                self.renderChart();
            });
        },

        renderChart: function()
        {

            var chartPoints = this.buildFlotPoints(this.timeInZones);
            var dataSeries = this.buildFlotDataSeries(chartPoints, chartColors.gradients.pace);
            var flotOptions = this.buildFlotChartOptions();

            var self = this;

            // let the html draw first so our container has a height and width
            setImmediate(function()
            {
                self.renderFlotChart(dataSeries, flotOptions);
            });
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

        buildFlotDataSeries: function (chartPoints, chartColor)
        {
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

        renderFlotChart: function(dataSeries, flotOptions)
        {
            if ($.plot)
            {
                this.plot = $.plot(this.ui.chartContainer, dataSeries, flotOptions);
            }
        }


    });

});