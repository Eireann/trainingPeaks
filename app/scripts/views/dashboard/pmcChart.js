define(
[
    "underscore",
    "./dashboardChartBase",
    "moment",
    "TP",
    "models/reporting/pmcModel",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "utilities/charting/jquery.flot.dashes",
    "views/dashboard/pmcChartSettings",
    "hbs!templates/views/dashboard/pmcChart"
],
function(
    _,
    DashboardChartBase,
    moment,
    TP,
    PMCModel,
    defaultFlotOptions,
    chartColors,
    flotDashes,
    pmcChartSettings,
    pmcChartTemplate
    )
{

    // TODO: Migrate Pmc Chart View and Default Chart View to use new format from fitness summary chart    
    var PmcChart = {
        lineThickness: 1,
        pointRadius: 1.5,
        chartType: 32, // 32 = pmc chart
        modelClass: PMCModel,

        className: DashboardChartBase.className + " pmcChart",

        template:
        {
            type: "handlebars",
            template: pmcChartTemplate
        },

        renderChart: function()
        {
            var TSBRange = this.findTSBRange(this.chartDataModel.get("data"));
            var chartPoints = this.buildFlotPoints(this.chartDataModel.get("data"), TSBRange.minAxisValue);
            var dataSeries = this.buildFlotDataSeries(chartPoints, chartColors);
            var flotOptions = this.buildFlotChartOptions(TSBRange);

            var self = this;

            // let the html draw first so our container has a height and width
            setImmediate(function()
            {
                self.renderFlotChart(dataSeries, flotOptions);
                self.ui.chartContainer.on("plotclick", _.bind(self.onPlotClick, self));
            });
        },
        
        onPlotClick: function(event, position, item)
        {
            console.log(event, position, item);
            
            var day = this.chartDataModel.get('data')[item.dataIndex].workoutDay

        },

        findTSBRange: function(modelData)
        {
            var maxValue = 0;
            _.each(modelData, function (item, index)
            {
                if (item.hasOwnProperty("tsb") && Math.abs(Number(item.tsb)) > maxValue)                
                    maxValue = Math.abs(item.tsb);
            });

            // center TSB axis range around zero, extend to nearest twenty
            var paddedMaxToNearestTen = Math.round((maxValue + 15) / 10) * 10;
            var range = {
                maxAxisValue: paddedMaxToNearestTen,
                minAxisValue: paddedMaxToNearestTen * -1 
            };

            return range;
        },

        buildFlotPoints: function(modelData, TSBMinimum)
        {
            var chartPoints = {
                TSS: [],
                ATL: [],
                CTL: [],
                TSB: [],
                IF: [],
                TSSFuture: [],
                ATLFuture: [],
                CTLFuture: [],
                TSBFuture: [],
                IFFuture: []
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

                    chartPoints.IF.push([dayMomentValue, item.ifActual]);
                    chartPoints.IFFuture.push([dayMomentValue, null]);

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
                    chartPoints.IFFuture.push([dayMomentValue, item.ifPlanned]);

                    chartPoints.TSS.push([dayMomentValue, null]);
                    chartPoints.ATL.push([dayMomentValue, null]);
                    chartPoints.CTL.push([dayMomentValue, null]);
                    chartPoints.TSB.push([dayMomentValue, null]);
                    chartPoints.IF.push([dayMomentValue, null]);
                    // put past values into the past point arrays
                } else
                {
                    //console.log(itemDate + " is past");
                    chartPoints.TSS.push([dayMomentValue, item.tssActual]);
                    chartPoints.ATL.push([dayMomentValue, item.atl]);
                    chartPoints.CTL.push([dayMomentValue, item.ctl]);
                    chartPoints.TSB.push([dayMomentValue, item.tsb, TSBMinimum]);
                    chartPoints.IF.push([dayMomentValue, item.ifActual]);

                    chartPoints.TSSFuture.push([dayMomentValue, null]);
                    chartPoints.ATLFuture.push([dayMomentValue, null]);
                    chartPoints.CTLFuture.push([dayMomentValue, null]);
                    chartPoints.TSBFuture.push([dayMomentValue, null]);
                    chartPoints.IFFuture.push([dayMomentValue, null]);
                }

            }, this);
            return chartPoints;
        },

        buildFlotDataSeries: function(chartPoints, chartColors)
        {
            var series = [];

            series.push(this.buildCTLDataSeries(chartPoints.CTL, chartColors));
            series.push(this.buildCTLFutureDataSeries(chartPoints.CTLFuture, chartColors));
            series.push(this.buildCTLFutureDataSeriesFill(chartPoints.CTLFuture, chartColors));

            series.push(this.buildTSBDataSeries(chartPoints.TSB, chartColors));
            if (this.shouldShowTSBFill())
            {
                series.push(this.buildTSBFutureDataSeriesFill(chartPoints.TSBFuture, chartColors));
            }
            series.push(this.buildTSBFutureDataSeries(chartPoints.TSBFuture, chartColors));

            if (this.shouldShowIF())
            {
                series.push(this.buildIFDataSeries(chartPoints.IF, chartColors));
                series.push(this.buildIFFutureDataSeries(chartPoints.IFFuture, chartColors));
            }

            if (this.shouldShowTSS())
            {
                series.push(this.buildTSSDataSeries(chartPoints.TSS, chartColors));
                series.push(this.buildTSSFutureDataSeries(chartPoints.TSSFuture, chartColors));
            }

            series.push(this.buildATLDataSeries(chartPoints.ATL, chartColors));
            series.push(this.buildATLFutureDataSeries(chartPoints.ATLFuture, chartColors));

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
                    
                    show: true,
                    fill: true,
                    fillColor: chartColors.pmcColors.TSS,
                    radius: this.pointRadius
                },
                yaxis: this.shouldShowIF() ? 3 : 2
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
                    show: true,
                    fill: true,
                    fillColor: chartColors.pmcColors.TSS,
                    radius: this.pointRadius
                },
                yaxis: this.shouldShowIF() ? 3 : 2
            };

            return dataSeries;
        },

        buildIFDataSeries: function(chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.IF,
                points:
                {
                    show: true,
                    fill: true,
                    fillColor: chartColors.pmcColors.IF,
                    radius: this.pointRadius
                },
                yaxis: 2
            };

            return dataSeries;
        },

        buildIFFutureDataSeries: function(chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.IF,
                points:
                {
                    show: true,
                    fill: true,
                    fillColor: chartColors.pmcColors.IF,
                    radius: this.pointRadius
                },
                yaxis: 2
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
                    show: true,
                    lineWidth: this.lineThickness,
                    fill: false
                },
                yaxis: 1,
                shadowSize: 0
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
                    show: true,
                    lineWidth: this.lineThickness
                },
                yaxis: 1,
                shadowSize: 0
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
                    show: true,
                    lineWidth: this.lineThickness,
                    fill: true,
                    fillColor: { colors: [chartColors.pmcColors.ctlGradient.light, chartColors.pmcColors.ctlGradient.dark] }
                },
                yaxis: 1,
                shadowSize: 2
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
                    show: true,
                    lineWidth: this.lineThickness,
                    fill: true,
                    fillColor: { colors: [chartColors.pmcColors.ctlGradient.dark, chartColors.pmcColors.ctlGradient.light] }
                },
                yaxis: 1,
                shadowSize: 0

            };

            return dataSeries;
        },

        buildCTLFutureDataSeriesFill: function (chartPoints, chartColors)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: "transparent",
                lines:
                {
                    show: true,
                    fill: true,
                    fillColor: { colors: [chartColors.pmcColors.futureCTLGradient.light, chartColors.pmcColors.futureCTLGradient.dark] },
                    lineWidth: this.lineThickness
                },
                yaxis: 1,
                shadowSize: 0
            };

            return dataSeries;
        },

        buildTSBDataSeries: function(chartPoints, chartColors)
        {
            var yaxis = 2;
            if (this.shouldShowTSS())
                yaxis++;
            if (this.shouldShowIF())
                yaxis++;

            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.TSB,
                lines:
                {
                    show: true,
                    lineWidth: this.lineThickness
                },

                yaxis: yaxis,
                shadowSize: 0

            };

            if (this.shouldShowTSBFill())
            {
                dataSeries.lines.fill = true;
                dataSeries.lines.fillColor = { colors: [chartColors.pmcColors.tsbGradient.dark, chartColors.pmcColors.tsbGradient.light] };
                
            }

            return dataSeries;
        },

        buildTSBFutureDataSeries: function(chartPoints, chartColors)
        {
            var yaxis = 2;
            if (this.shouldShowTSS())
                yaxis++;
            if (this.shouldShowIF())
                yaxis++;

            var dataSeries =
            {
                data: chartPoints,
                color: chartColors.pmcColors.TSB,
                dashes:
                {
                    show: true,
                    lineWidth: this.lineThickness
                },
                yaxis: yaxis,
                shadowSize: 0
            };

            return dataSeries;
        },

        buildTSBFutureDataSeriesFill: function(chartPoints, chartColors)
        {
            var yaxis = 2;
            if (this.shouldShowTSS())
                yaxis++;
            if (this.shouldShowIF())
                yaxis++;

            var dataSeries =
            {
                data: chartPoints,
                color: "transparent",
                lines:
                {
                    show: true,
                    fill: true,
                    fillColor: { colors: [chartColors.pmcColors.tsbGradient.dark, chartColors.pmcColors.tsbGradient.light] },
                    lineWidth: this.lineThickness
                },
                yaxis: yaxis,
                shadowSize: 0
            };

            return dataSeries;
        },

        buildFlotChartOptions: function(TSBAxisRange)
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions(null);


            flotOptions.yaxes = [];

            flotOptions.grid.borderWidth = { top: 0, right: 1, bottom: 1, left: 1 };
            flotOptions.grid.borderColor = "#9a9999";
            //flotOptions.grid.aboveData = true;

            // atl / ctl = axis 1
            flotOptions.yaxes.push(
            {
                tickDecimals: 0,
                position: "left",
                color: "#000000",
                tickColor: "#d7d8d9",
                font: {
                    family: "HelveticaNeueW01-55Roma",
                    color: "#636569",
                    size: "9"
                },
                min: 0
            });

            // IF = axis 2
            if (this.shouldShowIF())
            {
                flotOptions.yaxes.push(
                {
                    tickDecimals: 1,
                    position: "right",
                    color: "transparent",
                    min: 0,
                    font: {
                        color: chartColors.pmcColors.IF,
                        family: "HelveticaNeueW01-55Roma",             
                        size: "9"
                    }
                });
            }

            // tss = axis 2 or 3 if we have IF
            if (this.shouldShowTSS())
            {
                flotOptions.yaxes.push(
                {
                    tickDecimals: 0,
                    position: "left",
                    color: "transparent",
                    font: {
                        color: chartColors.pmcColors.TSS,
                        family: "HelveticaNeueW01-55Roma",             
                        size: "9"
                    },
                    min: 0
                });
            }

            // tsb = axis 2, 3, or 4
            flotOptions.yaxes.push(
            {
                tickDecimals: 0,
                position: "right",
                color: "transparent",
                min: TSBAxisRange.minAxisValue,
                max: TSBAxisRange.maxAxisValue,
                font: {
                    color: chartColors.pmcColors.TSB,
                    family: "HelveticaNeueW01-55Roma",
                    size: "9"
                }
            });


            flotOptions.xaxes = [
            {
                color: "transparent",

                tickFormatter: function(value, axis)
                {
                    var instance = moment(value);
                    //todo: base formatter on settings
                    return instance.format("MM/DD/YY");
                },
                font: {
                    family: "HelveticaNeueW01-55Roma",
                    color: "#636569",
                    size: "9"
                }
            }];

            flotOptions.tooltipOpts.onHover = this.onHoverToolTip;

            return flotOptions;
        },

        buildTooltipData: function(flotItem)
        {
            var index = flotItem.dataIndex;
            var tips = [];
            var item = this.chartDataModel.get("data")[index];

            var itemDay = moment(item.workoutDay).hour(0);
            tips.push({ label: "Date", value: itemDay.format("MM/DD/YY") });

            var tss = item.tssActual;
            var intensity = item.ifActual;
            var ctl = item.ctl;
            var atl = item.atl;
            var tsb = item.tsb;

            if (itemDay.diff(this.today) > 0)
            {
                tss = item.tssPlanned;
                intensity = item.ifPlanned;
            }

            if (this.shouldShowTSS())
            {
                tips.push({ className: "TSS", label: "TSS", value: TP.utils.conversion.formatTSS(tss, { defaultValue: "--" }) });
            }

            if (this.shouldShowIF())
            {
                tips.push({ className: "IF", label: "Intensity Factor", value: TP.utils.conversion.formatIF(intensity, { defaultValue: "--" }) });
            }

            tips.push({ className: "ATL", label: "Acute Training Load (ATL)", value: TP.utils.conversion.formatTSS(atl, { defaultValue: "--" }) });
            tips.push({ className: "CTL", label: "Chronic Training Load (CTL)", value: TP.utils.conversion.formatTSS(ctl, { defaultValue: "--" }) });
            tips.push({ className: "TSB", label: "Training Stress Balance (TSB)", value: TP.utils.conversion.formatTSB(tsb, { defaultValue: "--" }) });
            return tips;
        },

        createChartSettingsView: function()
        {
            return new pmcChartSettings({ model: this.model });
        },

        listenToChartSettingsEvents: function()
        {
            this.model.on("change:showTSSPerDay", this.renderChart, this);
            this.model.on("change:showIntensityFactorPerDay", this.renderChart, this);
            this.model.on("change:showTSBFill", this.renderChart, this);
        },

        stopListeningToChartSettingsEvents: function()
        {
            this.model.off("change:showTSSPerDay", this.renderChart, this);
            this.model.off("change:showIntensityFactorPerDay", this.renderChart, this);
            this.model.off("change:showTSBFill", this.renderChart, this);
        },

        shouldShowTSS: function()
        {
            return this.getSetting("showTSSPerDay") ? true : false;
        },

        shouldShowIF: function()
        {
            return this.getSetting("showIntensityFactorPerDay") ? true : false;
        },

        shouldShowTSBFill: function()
        {
            return this.getSetting("showTSBFill") ? true : false;
        },

        setDefaultSettings: function(options)
        {
            this.setDefaultDateSettings(options);
            var defaultSettings = {
                atlConstant: 7,
                atlConstant2: 14,
                atlStartValue: 0,
                ctlConstant: 42,
                ctlStartValue: 0,
                showIntensityFactorPerDay: true,
                showTSBFill: false,
                showTSSPerDay: true,
                workoutTypeIds: ["0"]
            };
            var mergedSettings = _.extend(defaultSettings, this.model.attributes);
            this.model.set(mergedSettings, { silent: true });
        }

    };

    return TP.ItemView.extend(_.extend({}, DashboardChartBase, PmcChart));

});