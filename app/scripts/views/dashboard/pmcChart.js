﻿define(
[
    "underscore",
    "setImmediate",
    "moment",
    "TP",
    "models/reporting/pmcModel",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "hbs!templates/views/dashboard/pmcChart"
],
function (
    _,
    setImmediate,
    moment,
    TP,
    PMCModel,
    defaultFlotOptions,
    chartColors,
    pmcChartTemplate
    )
{
    return TP.ItemView.extend(
    {
        tagName: "div",
        className: "dashboardChart doubleWide",

        template:
        {
            type: "handlebars",
            template: pmcChartTemplate
        },

        initialize: function(options)
        {
            //remove when api endpoint is called
            this.on("render", this.renderChartAfterRender, this);
            
            var chartOptions =
            {
                startDate: moment().subtract('days', 90),
                endDate: moment()
            };
            this.model = new PMCModel(null, chartOptions);

            this.model.fetch();
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

            var chartPoints = this.buildFlotPoints();
            var dataSeries = this.buildFlotDataSeries(chartPoints, chartColors.gradients.pace);
            var flotOptions = this.buildFlotChartOptions();

            var self = this;

            // let the html draw first so our container has a height and width
            setImmediate(function()
            {
                self.renderFlotChart(dataSeries, flotOptions);
            });
        },

        buildFlotPoints: function()
        {
            var chartPoints = [];
            _.each(this.model.get("data"), function (item, index)
            {
                var dayMoment = moment(item.workoutDay).valueOf();
                chartPoints.push([dayMoment, item.tssActual]);
            }, this);
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

            flotOptions.yaxis =
            {
                tickDecimals: 0
            };

            flotOptions.xaxis =
            {
                color: "transparent"
            };

            flotOptions.xaxes = [
            {
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