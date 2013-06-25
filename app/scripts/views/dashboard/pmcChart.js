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

            this.setupViewModel(options);
            this.setupDataModel(options);
        },

        setupViewModel: function(options)
        {
            this.model = new TP.Model();
        },

        setupDataModel: function(options)
        {

            this.onWaitStart();

            var chartOptions = _.extend({}, options);
            _.extend(chartOptions,
                {
                    startDate: moment().subtract('days', 90),
                    endDate: moment()
                });

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
                self.setChartTitle();
            });
        },

        ui: 
        {
            chartContainer: ".chartContainer"
        },

        setChartTitle: function()
        {
            var workoutTypesTitle = this.buildWorkoutTypesTitle(this.pmcModel.workoutTypes);
            this.model.set("title", workoutTypesTitle);
        },

        buildWorkoutTypesTitle: function(workoutTypeIds)
        {
            var workoutTypeNames = [];
            _.each(workoutTypeIds, function(item, index)
            {
                var intItem = parseInt(item, 10);
                if (intItem === 0)
                    workoutTypeNames.push("All");
                else
                    workoutTypeNames.push(workoutTypes.getNameById(intItem));
            }, this);
            return "PMC - Workout Type: " + workoutTypeNames.join(", ");
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
            var chartPoints = this.buildFlotPoints(this.pmcModel.get("data"));
            var dataSeries = this.buildFlotDataSeries(chartPoints, chartColors);
            var flotOptions = this.buildFlotChartOptions();

            var self = this;

            // let the html draw first so our container has a height and width
            setImmediate(function()
            {
                self.renderFlotChart(dataSeries, flotOptions);
            });
        },

        buildFlotPoints: function(modelData)
        {
            var chartPoints = {
                TSS: [],
                ATL: [],
                CTL: []
            };

            _.each(modelData, function (item, index)
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
                    position: "right",
                    color: "transparent"
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