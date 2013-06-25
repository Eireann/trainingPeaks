﻿define(
[
    "underscore",
    "setImmediate",
    "moment",
    "TP",
    "models/reporting/pmcModel",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "utilities/charting/flotToolTipPositioner",
    "utilities/workout/workoutTypes",
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
    workoutTypes,
    pmcChartTemplate,
    tooltipTemplate
    )
{
    return TP.ItemView.extend(
    {
        tagName: "div",
        className: "dashboardChart doubleWide",
        showThrobber: true,

        template:
        {
            type: "handlebars",
            template: pmcChartTemplate
        },

        initialize: function(options)
        {
            _.bindAll(this, "onHoverToolTip");

            this.on("render", this.renderChartAfterRender, this);

            this.setupViewModel();
            this.setupDataModel();
        },

        setupViewModel: function()
        {
            this.model = new TP.Model();
        },

        setupDataModel: function()
        {

            this.onWaitStart();

            var chartOptions =
            {
                startDate: moment().subtract('days', 90),
                endDate: moment()
            };

            this.pmcModel = new PMCModel(null, chartOptions);

            this.bindPmcModelEvents();

            this.on("user:loaded", this.fetchData, this);

            this.on("close", this.unbindPmcModelEvents, this);
        },

        bindPmcModelEvents: function()
        {
            _.each(_.keys(this.modelEvents), function(eventName)
            {
                this.pmcModel.on(eventName, this[this.modelEvents[eventName]], this);
            }, this);
        },

        unbindPmcModelEvents: function()
        {
            _.each(_.keys(this.modelEvents), function(eventName)
            {
                this.pmcModel.off(eventName, this[this.modelEvents[eventName]], this);
            }, this);

        },

        fetchData: function()
        {
            var self = this;
            this.pmcModel.fetch().done(function()
            {
                self.setTitle();
            });
        },

        ui: 
        {
            chartContainer: ".chartContainer"
        },

        setTitle: function()
        {
            var workoutTypesLabel = "";
            _.each(this.pmcModel.workoutTypes, function(item, index)
            {
                var intItem = parseInt(item, 10);
                if (intItem === 0)
                    workoutTypesLabel += "All";
                else
                    workoutTypesLabel += workoutTypes.getNameById(intItem);

                if (index !== (this.pmcModel.workoutTypes.length-1))
                    workoutTypesLabel += ", ";
            }, this);
            this.model.set("title", "PMC - Workout Type: " + workoutTypesLabel);
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
            var data = this.pmcModel.get("data");
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
                },
                yaxis: 1 
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
                },
                yaxis: 2 
            };

            return dataSeries;
        },

        buildCTLDataSeries: function(chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: "blue",
                lines:
                {
                    show: true
                },
                yaxis: 2
            };

            return dataSeries;
        },

        buildFlotChartOptions: function()
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions(null);

            flotOptions.yaxes =
            [
                {
                    tickDecimals: 0,
                    position: "left"
                },
                {
                    tickDecimals: 0,
                    position: "right"
                }
            ];


            flotOptions.xaxes = [
            {
                color: "transparent",

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
            var tooltipHTML = tooltipTemplate({ tooltips: this.buildTooltipData(flotItem.dataIndex) });
            $tooltipEl.html(tooltipHTML);
            toolTipPositioner.updatePosition($tooltipEl, this.plot);
        },

        buildTooltipData: function(index)
        {
            var tips = [];
            var item = this.pmcModel.get("data")[index];
            tips.push({ label: "Date", value: moment(item.workoutDay).format("MM/DD/YY") });
            tips.push({ label: "TSS", value: TP.utils.conversion.formatTSS(item.tssActual, { defaultValue: "--" }) });
            tips.push({ label: "Acute Training Load ('ATL')", value: TP.utils.conversion.formatTSS(item.atl) });
            tips.push({ label: "Chronic Training Load ('CTL')", value: TP.utils.conversion.formatTSS(item.ctl) });
            return tips;
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