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
    "utilities/charting/jquery.flot.dashes",
    "utilities/workout/workoutTypes",
    "views/dashboard/pmcChartSettings",
    "views/dashboard/pmcChartUtils",
    "hbs!templates/views/dashboard/pmcChart",
    "hbs!templates/views/charts/chartTooltip"
],
function(
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
    pmcChartUtils,
    pmcChartTemplate,
    tooltipTemplate
    )
{
    var PmcChart = TP.ItemView.extend(
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

            this.pmcModel = new PMCModel(null, null);

            this.bindPmcModelEvents();

            this.on("user:loaded", this.fetchData, this);

            this.on("close", this.unbindPmcModelEvents, this);
        },

        bindPmcModelEvents: function()
        {
            _.each(_.without(_.keys(this.modelEvents), "change"), function(eventName)
            {
                this.pmcModel.on(eventName, this[this.modelEvents[eventName]], this);
            }, this);
        },

        unbindPmcModelEvents: function()
        {
            _.each(_.without(_.keys(this.modelEvents), "change"), function(eventName)
            {
                this.pmcModel.off(eventName, this[this.modelEvents[eventName]], this);
            }, this);

        },

        fetchData: function()
        {
            var self = this;

            if (theMarsApp.user.has("settings.dashboard.pmc"))
            {
                this.pmcModel.setParameters(pmcChartUtils.buildPmcParameters(theMarsApp.user.get("settings.dashboard.pmc")));
            }

            this.pmcModel.fetch().done(function()
            {
                self.setChartTitle();
                self.render();
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
            var workoutTypesTitle = this.buildWorkoutTypesTitle(this.pmcModel.workoutTypeIds);
            this.model.set("title", workoutTypesTitle);
        },

        buildWorkoutTypesTitle: function(workoutTypeIds)
        {
            var workoutTypeNames = [];

            if (workoutTypeIds.length === _.keys(TP.utils.workout.types.typesById).length)
            {
                workoutTypeNames.push("All");
            } else
            {
                _.each(workoutTypeIds, function(item, index)
                {
                    var intItem = parseInt(item, 10);
                    if (intItem === 0)
                        workoutTypeNames.push("All");
                    else
                        workoutTypeNames.push(workoutTypes.getNameById(intItem));
                }, this);
            }

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
            var TSBMinimum = this.findTSBMinimum(this.pmcModel.get("data"));
            var chartPoints = this.buildFlotPoints(this.pmcModel.get("data"), TSBMinimum);
            var dataSeries = this.buildFlotDataSeries(chartPoints, chartColors);
            var flotOptions = this.buildFlotChartOptions(TSBMinimum);

            var self = this;

            // let the html draw first so our container has a height and width
            setImmediate(function()
            {
                self.renderFlotChart(dataSeries, flotOptions);
            });
        },

        findTSBMinimum: function(modelData)
        {
            var min = 0;
            _.each(modelData, function(item, index)
            {
                if(item.hasOwnProperty("tsb") && Number(item.tsb) < min)
                {
                    min = item.tsb;
                }
            });
            return min;
        },

        buildFlotPoints: function(modelData, TSBMinimum)
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

            _.each(modelData, function(item, index)
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
                    chartPoints.TSBFuture.push([dayMomentValue, item.tsb, TSBMinimum]);

                    chartPoints.ATL.push([dayMomentValue, item.atl]);
                    chartPoints.CTL.push([dayMomentValue, item.ctl]);
                    chartPoints.TSB.push([dayMomentValue, item.tsb, TSBMinimum]);

                    // put all future value into the Future points arrays
                } else if (itemDate > this.today)
                {
                    //console.log(itemDate + " is future");
                    chartPoints.TSSFuture.push([dayMomentValue, item.tssPlanned]);
                    chartPoints.ATLFuture.push([dayMomentValue, item.atl]);
                    chartPoints.CTLFuture.push([dayMomentValue, item.ctl]);
                    chartPoints.TSBFuture.push([dayMomentValue, item.tsb, TSBMinimum]);

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
                    chartPoints.TSB.push([dayMomentValue, item.tsb, TSBMinimum]);

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
            var series = [];

            series.push(this.buildTSBDataSeries(chartPoints.TSB, chartColors));
            if (this.shouldShowTSBFill())
            {
                series.push(this.buildTSBFutureDataSeriesFill(chartPoints.TSBFuture, chartColors));
            }
            series.push(this.buildTSBFutureDataSeries(chartPoints.TSBFuture, chartColors));

            if (this.shouldShowTSS())
            {
                series.push(this.buildTSSDataSeries(chartPoints.TSS, chartColors));
                series.push(this.buildTSSFutureDataSeries(chartPoints.TSSFuture, chartColors));
            }

            series.push(this.buildATLDataSeries(chartPoints.ATL, chartColors));
            series.push(this.buildATLFutureDataSeries(chartPoints.ATLFuture, chartColors));

            series.push(this.buildCTLDataSeries(chartPoints.CTL, chartColors));
            series.push(this.buildCTLFutureDataSeries(chartPoints.CTLFuture, chartColors));

            return series;
        },

        buildTSSDataSeries: function(chartPoints, chartColors)
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

        buildTSSFutureDataSeries: function(chartPoints, chartColors)
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

        buildATLDataSeries: function(chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.ATL,
                lines:
                {
                    show: true
                },
                yaxis: this.shouldShowTSS() ? 2 : 1
            };

            return dataSeries;
        },

        buildATLFutureDataSeries: function(chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.ATL,
                dashes:
                {
                    show: true
                },
                yaxis: this.shouldShowTSS() ? 2 : 1
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
                yaxis: this.shouldShowTSS() ? 2 : 1
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
                yaxis: this.shouldShowTSS() ? 2 : 1
            };

            return dataSeries;
        },

        buildTSBDataSeries: function(chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.TSB,
                lines:
                {
                    show: true
                },
                yaxis: this.shouldShowTSS() ? 3 : 2
            };

            if (this.shouldShowTSBFill())
            {
                dataSeries.lines.fill = true;
            }

            return dataSeries;
        },

        buildTSBFutureDataSeries: function(chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.TSB,
                dashes:
                {
                    show: true
                },
                yaxis: this.shouldShowTSS() ? 3 : 2
            };

            return dataSeries;
        },

        buildTSBFutureDataSeriesFill: function(chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.TSB,
                lines:
                {
                    show: true,
                    fill: true
                },
                yaxis: this.shouldShowTSS() ? 3 : 2
            };

            return dataSeries;
        },

        buildFlotChartOptions: function(TSBMinimum)
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions(null);

            var tssAxisOptions = {
                tickDecimals: 0,
                position: "left",
                color: "transparent",
                font: {
                    color: chartColors.pmcColors.TSS
                }
            };

            flotOptions.yaxes =
            [
                {
                    tickDecimals: 0,
                    position: "left",
                    color: "transparent"
                },
                {
                    tickDecimals: 0,
                    position: "right",
                    color: "transparent",
                    min: TSBMinimum,
                    font: {
                        color: chartColors.pmcColors.TSB
                    }
                }
            ];

            if (this.shouldShowTSS())
            {
                flotOptions.yaxes.unshift(tssAxisOptions);
            }


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

        onHoverToolTip: function(flotItem, $tooltipEl)
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

            if (this.shouldShowTSS())
            {
                tips.push({ label: "TSS", value: TP.utils.conversion.formatTSS(tss, { defaultValue: "--" }) });
            }

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

        pmcSettingsClicked: function(e)
        {
            if (e && e.button && e.button === 2)
            {
                return;
            }

            e.preventDefault();

            this.keepSettingsButtonVisible();
            var offset = $(e.currentTarget).offset();
            this.pmcSettings = new pmcChartSettings({ model: theMarsApp.user });
            this.pmcSettings.render().top(offset.top - 10).left(offset.left + 20);
            this.pmcSettings.on("close", this.onPmcSettingsClose, this);

            theMarsApp.user.on("change:settings.dashboard.pmc.showTSSPerDay", this.renderChart, this);
            theMarsApp.user.on("change:settings.dashboard.pmc.showIntensityFactorPerDay", this.renderChart, this);
            theMarsApp.user.on("change:settings.dashboard.pmc.showTSBFill", this.renderChart, this);
        },

        keepSettingsButtonVisible: function()
        {
            this.$el.addClass("menuOpen");
        },

        allowSettingsButtonToHide: function()
        {
            this.$el.removeClass("menuOpen");
        },

        onPmcSettingsClose: function()
        {
            this.allowSettingsButtonToHide();
            this.fetchData();

            theMarsApp.user.off("change:settings.dashboard.pmc.showTSSPerDay", this.renderChart, this);
            theMarsApp.user.off("change:settings.dashboard.pmc.showIntensityFactorPerDay", this.renderChart, this);
            theMarsApp.user.off("change:settings.dashboard.pmc.showTSBFill", this.renderChart, this);
        },

        shouldShowTSS: function()
        {
            if (!theMarsApp.user.has("settings.dashboard.pmc"))
            {
                return true;
            }
            return theMarsApp.user.get("settings.dashboard.pmc.showTSSPerDay") ? true : false;
        },

        shouldShowTSBFill: function()
        {
            if (!theMarsApp.user.has("settings.dashboard.pmc"))
            {
                return true;
            }
            return theMarsApp.user.get("settings.dashboard.pmc.showTSBFill") ? true : false;
        }

    });


    return PmcChart;
});