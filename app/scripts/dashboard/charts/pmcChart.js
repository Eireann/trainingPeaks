define(
[
    "jquery",
    "underscore",
    "framework/chart",
    "moment",
    "TP",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "utilities/charting/jquery.flot.dashes",
    "views/dashboard/chartUtils",
    "models/workoutsCollection",
    "dashboard/views/pmcChartSettings",
    "dashboard/views/PmcWorkoutsListView",
    "shared/utilities/calendarUtility",
    "hbs!dashboard/templates/pmcChart"
],
function(
    $,
    _,
    Chart,
    moment,
    TP,
    defaultFlotOptions,
    chartColors,
    flotDashes,
    DashboardChartUtils,
    WorkoutsCollection,
    pmcChartSettings,
    PmcWorkoutsListView,
    CalendarUtility,
    pmcChartTemplate
    )
{

    var PmcChart = Chart.extend({
        lineThickness: 1,
        pointRadius: 1.5,

        settingsView: pmcChartSettings, 

        constructor: function(options)
        {
            PmcChart.__super__.constructor.apply(this, arguments);
            this.calendarManager = options.calendarManager || theMarsApp.calendarManager;
        },

        defaults: {
                atlConstant: 7,
                atlConstant2: 14,
                atlStartValue: 0,
                ctlConstant: 42,
                ctlStartValue: 0,
                showIntensityFactorPerDay: true,
                showTSBFill: false,
                showTSSPerDay: true,
                workoutTypeIds: ["0"]
        },

        template:
        {
            type: "handlebars",
            template: pmcChartTemplate
        },

        defaultTitle: function()
        {
            var title = TP.utils.translate("Performance Manager - Workout Type: ");
            var workoutTypeIds = _.reject(this.get("workoutTypeIds"), function(id)
            {
                return id === 0 || id === "0";
            });
            title += TP.utils.workout.types.getListOfNames(workoutTypeIds);
            return title;
        },

        getChartName: function()
        {
            return "Pmc Chart";
        },

        fetchData: function()
        {
            var dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions") || {});

            var postData = {
                workoutTypes: _.without(this._buildWorkoutTypes(), 0),
                ctlConstant: this.get("ctlConstant"),
                ctlStart: this.get("ctlStartValue"),
                atlConstant: this.get("atlConstant"),
                atlStart: this.get("atlStartValue")
            };

            return this.dataManager.fetchReport("performancedata", dateOptions.startDate, dateOptions.endDate, postData);
        },

        _buildWorkoutTypes: function()
        {
            // 0 == all
            var requestedWorkoutTypes = this.has("workoutTypeIds") ? this.get("workoutTypeIds") : [];
            requestedWorkoutTypes = _.filter(requestedWorkoutTypes, function(type)
            {
                return type.trim() !== "" && Number(type) !== 0;
            });

            if (requestedWorkoutTypes.length && requestedWorkoutTypes.length < _.keys(TP.utils.workout.types.typesById).length)
            {
                return _.map(requestedWorkoutTypes, function(typeId){return Number(typeId);});
            } else {
                return [0];
            }
        },

        parseData: function(data)
        {
            this.rawData = data;

            var TSBRange = this.findTSBRange(data);
            var chartPoints = this.buildFlotPoints(data, TSBRange.minAxisValue);
            var dataSeries = this.buildFlotDataSeries(chartPoints, chartColors);
            var flotOptions = this.buildFlotChartOptions(TSBRange);

            return {
                dataSeries: dataSeries,
                flotOptions: flotOptions
            };
        },

        createItemDetailView: function(item, position)
        {            
            if (!item)
            {
                return;
            }

            var dataItem = this.rawData[item.dataIndex];

            // only return this view if IF or TSS values are defined
            if (!(dataItem.ifActual || dataItem.tssActual))
            {
                return;
            }

            var date = moment(dataItem.workoutDay).format(CalendarUtility.idFormat);
            var day = this.calendarManager.days.get(date);
            this.calendarManager.loadActivities(date);

            var view = new PmcWorkoutsListView.Tomahawk({ model: day, target: $.Event("", position), offset: "right" });
            return view;
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
            var today = moment().hour(0).format("YYYY-MM-DD");

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
                if (itemDate === today)
                {

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
                } else if (itemDate > today)
                {
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
                    return TP.utils.datetime.format(value);
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
            var today = moment().hour(0).format("YYYY-MM-DD");
            var index = flotItem.dataIndex;
            var tips = [];
            var item = this.rawData[index];

            var itemDay = moment(item.workoutDay).hour(0);
            tips.push({ label: "Date", value: TP.utils.datetime.format(itemDay) });

            var tss = item.tssActual;
            var intensity = item.ifActual;
            var ctl = item.ctl;
            var atl = item.atl;
            var tsb = item.tsb;

            if (itemDay.diff(today) > 0)
            {
                tss = item.tssPlanned;
                intensity = item.ifPlanned;
            }

            if (this.shouldShowTSS())
            {
                tips.push({ className: "TSS", label: "TSS", value: TP.utils.conversion.formatUnitsValue("tss", tss, { defaultValue: "--" }) });
            }

            if (this.shouldShowIF())
            {
                tips.push({ className: "IF", label: "Intensity Factor", value: TP.utils.conversion.formatUnitsValue("if", intensity, { defaultValue: "--" }) });
            }

            tips.push({ className: "ATL", label: "Acute Training Load (ATL)", value: TP.utils.conversion.formatUnitsValue("tss", atl, { defaultValue: "--" }) });
            tips.push({ className: "CTL", label: "Chronic Training Load (CTL)", value: TP.utils.conversion.formatUnitsValue("tss", ctl, { defaultValue: "--" }) });
            tips.push({ className: "TSB", label: "Training Stress Balance (TSB)", value: TP.utils.conversion.formatUnitsValue("tsb", tsb, { defaultValue: "--" }) });
            return tips;
        },

        shouldShowTSS: function()
        {
            return this.get("showTSSPerDay") ? true : false;
        },

        shouldShowIF: function()
        {
            return this.get("showIntensityFactorPerDay") ? true : false;
        },

        shouldShowTSBFill: function()
        {
            return this.get("showTSBFill") ? true : false;
        }

    });

    return PmcChart;

});
