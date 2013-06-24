define(
[
    "underscore",
    "setImmediate",
    "moment",
    "TP",
    "models/reporting/pmcModel",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "utilities/charting/flotToolTipPositioner",
    "hbs!templates/views/dashboard/pmcChart",
    "hbs!templates/views/charts/chartTooltip"
],
function (
    _,
    setImmediate,
    moment,
    TP,
    PMCModel,
    defaultFlotOptions,
    chartColors,
    toolTipPositioner,
    pmcChartTemplate,
    tooltipTemplate
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
            _.bindAll(this, "onHoverToolTip");
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
            var dataSeries = this.buildFlotDataSeries(chartPoints, chartColors);
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
            var data = this.model.get("data");
            var chartPoints = {
                TSS: [],
                ATL: [],
                CTL: []
            };

            _.each(data, function (item, index)
            {
                var dayMoment = moment(item.workoutDay).valueOf();
                chartPoints.TSS.push([dayMoment, item.tssActual]);
                chartPoints.ATL.push([dayMoment, item.atl]);
                chartPoints.CTL.push([dayMoment, item.ctl]);
            }, this);
            return chartPoints;
        },

        buildFlotDataSeries: function(chartPoints, chartColors)
        {
            return [
                this.buildTSSDataSeries(chartPoints.TSS, chartColors),
                this.buildATLDataSeries(chartPoints.ATL, chartColors),
                this.buildCTLDataSeries(chartPoints.CTL, chartColors)
            ];
        },

        buildTSSDataSeries: function (chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: "red",
                points:
                {
                    show: true
                }
            };

            return dataSeries;
        },

        buildATLDataSeries: function (chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: "pink",
                lines:
                {
                    show: true
                }
            };

            return dataSeries;
        },

        buildCTLDataSeries: function (chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: "blue",
                lines:
                {
                    show: true
                }
            };

            return dataSeries;
        },

        buildFlotChartOptions: function()
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions(null);

            flotOptions.yaxes =
            [
                {
                    tickDecimals: 0
                },
                {
                    tickDecimals: 0
                },
                {
                    tickDecimals: 0
                }
            ];

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

            flotOptions.tooltipOpts.onHover = this.onHoverToolTip;

            return flotOptions;
        },
        
        onHoverToolTip: function (flotItem, $tooltipEl)
        {

            var tooltipData =
            {
                tooltips:
                    [{ label: "Date", value: moment(flotItem.datapoint[0]).format("MM/DD/YY") }, { label: "TSS", value: TP.utils.conversion.formatTSS(flotItem.datapoint[1]) }]
            };
            var tooltipHTML = tooltipTemplate(tooltipData);
            $tooltipEl.html(tooltipHTML);
            toolTipPositioner.updatePosition($tooltipEl, this.plot);
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