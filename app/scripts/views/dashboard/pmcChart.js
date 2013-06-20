define(
[
    "setImmediate",
    "moment",
    "TP",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "hbs!templates/views/dashboard/pmcChart"
],
function(
    setImmediate,
    moment,
    TP,
    defaultFlotOptions,
    chartColors,
    pmcChartTemplate
    )
{
    return TP.ItemView.extend({

        tagName: "div",
        className: "dashboardChart",

        template:
        {
            type: "handlebars",
            template: pmcChartTemplate
        },

        initialize: function(options)
        {
            this.on("render", this.renderChartAfterRender, this);

            this.model = new TP.Model({
                title: "PMC",
                yaxisLabel: "TSS",
                xaxisLabel: "Date"
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
            var chartPoints = [];
            for (var i = 0; i < 100; i++)
            {
                var day = moment().subtract('days', 100 - i).valueOf();
                var tss;
                if (i % 7 === 0)
                    tss = 0;
                else
                    tss = 80 + (40 * Math.random());
                chartPoints.push([day, tss]);
            }
            return chartPoints;
        },

        buildFlotDataSeries: function (chartPoints, chartColor)
        {
            var dataSeries =
            {
                data: chartPoints,
                points:
                {
                    show: true
                }
            };

            return [dataSeries];
        },

        buildFlotChartOptions: function()
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions(null);

            flotOptions.yaxis = {
                tickDecimals: 0
            };

            flotOptions.xaxis = {
                color: "transparent"
            };

            flotOptions.xaxes = [{
                tickFormatter: function(value, axis)
                {
                    var instance = moment(value);
                    //todo: base formatter on settings
                    return instance.format("MM/DD/YY");
                }
            }];

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