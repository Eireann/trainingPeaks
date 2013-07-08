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
    "utilities/charting/jquery.flot.dashes",
    "utilities/workout/workoutTypes",
    "views/dashboard/pmcChartSettings",
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
    flotDashes,
    workoutTypes,
    pmcChartSettings,
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

            // use zero hour to avoid time zone issues in day diff calculation
            this.today = moment().hour(0).format("YYYY-MM-DD");

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
                    endDate: moment().add('days', 21)
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

        events:
        {
            "mouseup .settings": "pmcSettingsClicked"
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
                CTL: [],
                TSB: [],
                TSSFuture: [],
                ATLFuture: [],
                CTLFuture: [],
                TSBFuture: []
            };

            _.each(modelData, function (item, index)
            {
                var dayMoment = moment(item.workoutDay);
                var dayMomentValue = dayMoment.valueOf();
                var itemDate = dayMoment.format("YYYY-MM-DD");

                // include null padding in our arrays, so the tooltip indexes work out correctly

                // for today, overlap the atl/ctl/csb lines so there is not a gap between present and future,
                // but don't duplicate TSS
                 if (itemDate === this.today)
                 {

                     //console.log(itemDate + " is today");
                    chartPoints.TSS.push([dayMomentValue, item.tssActual]);
                    chartPoints.TSSFuture.push([dayMomentValue, null]);

                    chartPoints.ATLFuture.push([dayMomentValue, item.atl]);
                    chartPoints.CTLFuture.push([dayMomentValue, item.ctl]);
                    chartPoints.TSBFuture.push([dayMomentValue, item.tsb]);

                    chartPoints.ATL.push([dayMomentValue, item.atl]);
                    chartPoints.CTL.push([dayMomentValue, item.ctl]);
                    chartPoints.TSB.push([dayMomentValue, item.tsb]);

                // put all future value into the Future points arrays
                } else if (itemDate > this.today)
                {
                    //console.log(itemDate + " is future");
                    chartPoints.TSSFuture.push([dayMomentValue, item.tssPlanned]);
                    chartPoints.ATLFuture.push([dayMomentValue, item.atl]);
                    chartPoints.CTLFuture.push([dayMomentValue, item.ctl]);
                    chartPoints.TSBFuture.push([dayMomentValue, item.tsb]);

                    chartPoints.TSS.push([dayMomentValue, null]);
                    chartPoints.ATL.push([dayMomentValue, null]);
                    chartPoints.CTL.push([dayMomentValue, null]);
                    chartPoints.TSB.push([dayMomentValue, null]);

                    // put past values into the past point arrays
                } else
                {
                    //console.log(itemDate + " is past");
                    chartPoints.TSS.push([dayMomentValue, item.tssActual]);
                    chartPoints.ATL.push([dayMomentValue, item.atl]);
                    chartPoints.CTL.push([dayMomentValue, item.ctl]);
                    chartPoints.TSB.push([dayMomentValue, item.tsb]);

                    chartPoints.TSSFuture.push([dayMomentValue, null]);
                    chartPoints.ATLFuture.push([dayMomentValue, null]);
                    chartPoints.CTLFuture.push([dayMomentValue, null]);
                    chartPoints.TSBFuture.push([dayMomentValue, null]);
                }

            }, this);
            return chartPoints;
        },

        buildFlotDataSeries: function(chartPoints, chartColors)
        {
            return [
                this.buildTSSDataSeries(chartPoints.TSS, chartColors),
                this.buildTSSFutureDataSeries(chartPoints.TSSFuture, chartColors),
                this.buildATLDataSeries(chartPoints.ATL, chartColors),
                this.buildATLFutureDataSeries(chartPoints.ATLFuture, chartColors),
                this.buildCTLDataSeries(chartPoints.CTL, chartColors),
                this.buildCTLFutureDataSeries(chartPoints.CTLFuture, chartColors),
                this.buildTSBDataSeries(chartPoints.TSB, chartColors),
                this.buildTSBFutureDataSeries(chartPoints.TSBFuture, chartColors)
            ];
        },

        buildTSSDataSeries: function (chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.TSS,
                points:
                {
                    show: true
                },
                yaxis: 1
            };

            return dataSeries;
        },

        buildTSSFutureDataSeries: function (chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.TSS,
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
                color: chartColors.pmcColors.ATL,
                lines:
                {
                    show: true
                },
                yaxis: 2
            };

            return dataSeries;
        },

        buildATLFutureDataSeries: function (chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.ATL,
                dashes:
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
                color: chartColors.pmcColors.CTL,
                lines:
                {
                    show: true
                },
                yaxis: 2
            };

            return dataSeries;
        },

        buildCTLFutureDataSeries: function(chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.CTL,
                dashes:
                {
                    show: true
                },
                yaxis: 2
            };

            return dataSeries;
        },

        buildTSBDataSeries: function (chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.TSB,
                lines:
                {
                    show: true
                },
                yaxis: 3
            };

            return dataSeries;
        },

        buildTSBFutureDataSeries: function (chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.TSB,
                dashes:
                {
                    show: true
                },
                yaxis: 3
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
                    position: "left",
                    color: "transparent",
                    font: {
                        color: chartColors.pmcColors.TSS
                    }
                },
                {
                    tickDecimals: 0,
                    position: "left",
                    color: "transparent"
                },
                {
                    tickDecimals: 0,
                    position: "right",
                    color: "transparent",
                    font: {
                        color: chartColors.pmcColors.TSB
                    }
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

            var itemDay = moment(item.workoutDay).hour(0);
            tips.push({ label: "Date", value: itemDay.format("MM/DD/YY") });

            var tss = item.tssActual;
            var ctl = item.ctl;
            var atl = item.atl;
            var tsb = item.tsb;

            if (itemDay.diff(this.today) > 0)
            {
                tss = item.tssPlanned;
            }

            tips.push({ label: "TSS", value: TP.utils.conversion.formatTSS(tss, { defaultValue: "--" }) });
            tips.push({ label: "Acute Training Load (ATL)", value: TP.utils.conversion.formatTSS(atl) });
            tips.push({ label: "Chronic Training Load (CTL)", value: TP.utils.conversion.formatTSS(ctl) });
            tips.push({ label: "Training Stress Balance (TSB)", value: TP.utils.conversion.formatTSB(tsb) });
            return tips;
        },

        renderFlotChart: function(dataSeries, flotOptions)
        {
            if ($.plot)
            {
                this.plot = $.plot(this.ui.chartContainer, dataSeries, flotOptions);
            }
        },

        pmcSettingsClicked: function (e)
        {
            if (e && e.button && e.button === 2)
            {
                return;
            }

            e.preventDefault();

            this.keepSettingsButtonVisible();
            var offset = $(e.currentTarget).offset();
            this.pmcSettings = new pmcChartSettings({ model: this.model });
            this.pmcSettings.render().bottom(offset.top + 10).center(offset.left - 2);
            this.pmcSettings.on("close", this.allowSettingsButtonToHide, this);
            this.pmcSettings.on("mouseleave", this.onMouseLeave, this);
        },

        keepSettingsButtonVisible: function ()
        {
            this.$el.addClass("menuOpen");
        },
    });
});