define(
[
    "TP",
    "framework/chart",
    "utilities/charting/chartColors",
    "utilities/charting/flotOptions",
    "views/dashboard/chartUtils",
    "shared/utilities/chartingAxesBuilder",
    "dashboard/views/workoutSummaryChartSettingsView"
],
function(
    TP,
    Chart,
    chartColors,
    defaultFlotOptions,
    DashboardChartUtils,
    ChartingAxesBuilder,
    DashboardSettingsView
)
{

    var distanceDurationTooltips = [{
        label: "Planned Distance",
        key: "distancePlanned",
        units: "distance"
    }, {
        label: "Completed Distance",
        key: "distanceActual",
        units: "distance"
    }, {
        label: "Planned Duration",
        key: "totalTimePlanned",
        units: "hours"
    }, {
        label: "Completed Duration",
        key: "totalTimeActual",
        units: "hours"
    }];

    var longestTooltips = [{
        label: "Planned Distance",
        key: "distancePlanned",
        units: "distance"
    }, {
        label: "Completed Distance",
        key: "distance",
        units: "distance"
    }, {
        label: "Planned Duration",
        key: "totalTimePlanned",
        units: "hours"
    }, {
        label: "Completed Duration",
        key: "timeTotal",
        units: "hours"
    }];

    var WorkoutSummaryChart = Chart.extend({

        settingsView: DashboardSettingsView,

        subTypes: [{
            chartType: 10,
            endpoint: "workoutsummary",
            title: "Durration",
            series: [{
                key: "totalTimeActual",
                units: "hours"
            }],
            plannedSeries: [{
                key: "totalTimePlanned",
                units: "hours"
            }],
            tooltips: distanceDurationTooltips
        }, {
            chartType: 11,
            endpoint: "workoutsummary",
            title: "Distance",
            series: [{
                key: "distanceActual",
                units: "distance"
            }],
            plannedSeries: [{
                key: "disntancePlanned",
                units: "distance"
            }],
            tooltips: distanceDurationTooltips
        }, {
            chartType: 21,
            endpoint: "workoutsummary",
            title: "Kilojoules",
            series: [{
                key: "totalKilojoulesBurned",
                units: "energy"
            }],
            tooltips: [{
                key: "totalKilojoulesBurned",
                units: "energy"
            }]
        }, {
            chartType: 23,
            endpoint: "workoutsummary",
            title: "TSS",
            series: [{
                key: "totalTrainingStressScoreActual",
                units: "tss",
                widthScale: 2 * 0.7,
                color: chartColors.pmcColors.TSS,
            }, {
                key: "averageIntensityFactorActual",
                units: "if",
                widthScale: 2 * 0.3,
                color: chartColors.pmcColors.IF,
            }],
            tooltips: [{
                label: "TSS",
                key: "totalTrainingStressScoreActual",
                units: "tss"
            }, {
                label: "IF",
                key: "averageIntensityFactorActual",
                units: "if"
            }]
        }, {
            chartType: 37,
            endpoint: "workoutsummary",
            title: "Elevation Gain",
            series: [{
                key: "totalElevationGainActual",
                units: "elevation"
            }],
            tooltips: [{
                label: "Elevation Gain",
                key: "totalElevationGainActual",
                units: "elevation"
            }]
        }, {
            chartType: 19,
            endpoint: "longestworkout",
            title: "Longest Workout (Distance)",
            onlyByWeek: true,
            series: [{
                key: "distance",
                units: "distance"
            }],
            plannedSeries: [{
                key: "distancePlanned",
                units: "distance"
            }],
            tooltips: longestTooltips
        }, {
            chartType: 20,
            endpoint: "longestworkout",
            title: "Longest Workout (Duration)",
            onlyByWeek: true,
            series: [{
                key: "timeTotal",
                units: "hours"
            }],
            plannedSeries: [{
                key: "totalTimePlanned",
                units: "hours"
            }],
            tooltips: longestTooltips
        }],

        defaults: {
            workoutTypeIds: [],
            workoutSummaryDateGrouping: 2, // 1: Day, 2: Week
            showPlanned: true
        },

        initialize: function(attributes, options)
        {
            this.subType = _.find(this.subTypes, function(subType)
            {
                return subType.chartType === parseInt(this.get('chartType'), 10);
            }, this);
            this.subType.hasPlanned = this.subType.plannedSeries && this.subType.plannedSeries.length > 0;
            this._validateWorkoutTypes();
            this.updateChartTitle(); 
        },

        fetchData: function()
        {
            var dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions"));
            var postData =
            {
                groupByWorkoutType: this.get("workoutTypeIds").length !== 0 || true,
                dateGrouping: this.get("workoutSummaryDateGrouping") || 1
            };
            return this.dataManager.fetchReport(this.subType.endpoint, dateOptions.startDate, dateOptions.endDate, postData);
        },

        updateChartTitle: function()
        {
            if(this.subType.onlyByWeek)
            {
                var title = TP.utils.translate(this.subType.title + ": ");
            }
            else
            {
                var dateGrouping = this.get("workoutSummaryDateGrouping") === 1 ? "Day" : "Week";
                var title = TP.utils.translate(this.subType.title + " by " + dateGrouping + ": ");
            }
            title += TP.utils.workout.types.getListOfNames(this.get("workoutTypeIds"), "All Workout Types");
            this.set("title", title);
        },

        parseData: function(data)
        {
            var self = this;
            data = this.data = this._preprocessData(data);

            var dateGrouping = this.get("workoutSummaryDateGrouping") === 1 ?"day" : "week";
            var barWidth = moment.duration(1, dateGrouping).valueOf() * 0.7 / this.subType.series.length;
            var series = _.map(this.subType.series, function(series, i)
            {
                return this._buildSeries(data, series.key, _.extend({
                    onlySeries: this.subType.series.length === 1,
                    bars: {
                        order: i,
                        barWidth: barWidth  * (series.widthScale || 1),
                    }
                }, series));
            }, this);

            var plannedSeries = [];
            
            if(this.get("showPlanned")) {
                plannedSeries = _.map(this.subType.plannedSeries, function(series)
                {
                    return this._buildSeries(data, series.key, _.extend({bars: {show: false}, lines: {show: true}}, series));
                }, this);
            }

            series = series.concat(plannedSeries);
            var yaxes = ChartingAxesBuilder.makeYaxes(series, { workoutTypeId: this._getSingleWorkoutTypeId() });
            console.log(yaxes);

            return {
                dataSeries: series,
                flotOptions: _.defaults({
                    bars:
                    {
                        show: true,
                        lineWidht: 1,
                        barWidth: barWidth,
                        lineWidth: 0.00000001 // 0 causes flot.orderBars to default to 2 for calculations... which aren't redone on resize.
                    },
                    yaxes: yaxes,
                    xaxis:
                    {
                        ticks: function(axis)
                        {
                            var date = self._adjustDateToWeek(axis.min);
                            var delta = moment.duration(axis.delta * 1.3).asDays();

                            if(self.get("workoutSummaryDateGrouping") === 1)
                            {
                                delta = Math.ceil(delta);
                            }
                            else
                            {
                                delta = Math.ceil(delta / 7) * 7;
                            }

                            var ticks = [date.valueOf()];

                            while(_.last(ticks) <= axis.max)
                            {
                                date.add(delta, "days");
                                ticks.push(date.valueOf());
                            }

                            return ticks;
                        },
                        tickFormatter: function(date)
                        {
                            return moment(date).format("L");
                        }
                    }
                }, defaultFlotOptions.getBarOptions(null)),
            };
        },

        _preprocessData: function(data)
        {
            var workoutTypeIds = _.map(this.get("workoutTypeIds"), function(id) { return parseInt(id, 10); });

            if(workoutTypeIds.length > 0)
            {
                data = _.filter(data, function(entry)
                {
                    return _.include(workoutTypeIds, parseInt(entry.workoutTypeId, 10));
                });
            }

            var mergedData = {};

            // Force start/end date to be included in chart.
            var dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions"));
            var dateGrouping = this.get("workoutSummaryDateGrouping");
            if(dateGrouping === 2) // Week
            {
                dateOptions.startDate = this._adjustDateToWeek(dateOptions.startDate);
                dateOptions.endDate = this._adjustDateToWeek(dateOptions.endDate);
            }

            mergedData[dateOptions.startDate.valueOf()] = {};
            mergedData[dateOptions.endDate.valueOf()] = {};

            _.each(data, function(entry)
            {
                var x = moment(entry.workoutDay || entry.startWorkoutDate || entry.startDate).valueOf();
                if (mergedData[x] === undefined)
                {
                    mergedData[x] = {};
                }

                _.each(entry, function(value, key)
                {
                    mergedData[x][key] = (mergedData[x][key] || []);
                    mergedData[x][key].push(value);
                });
            });

            _.each(mergedData, function(entry, x)
            {
                _.each(entry, function(value, key)
                {
                    switch(key)
                    {
                        case "averageIntensityFactorActual":
                            value = _.reduce(value, function(a, b) { return a + b; }) / value.length;
                            break;
                        default:
                            value = _.reduce(value, function(a, b) { return a + b; });
                            break;
                    }
                    entry[key] = value;
                });

                entry.date = parseInt(x, 10);
            });

            return _.sortBy(_.values(mergedData), "date");
        },

        _buildSeries: function(data, key, options)
        {
            var offset = 0;
            if(options.onlySeries)
            {
                offset = -(options.bars.barWidth / 2);
            }

            var points = _.map(data, function(entry)
            {
                return [entry.date + offset, entry[key] || 0];
            });

            points = _.sortBy(points, 0);

            return _.extend({ data: points }, options);
        },

        buildTooltipData: function(flotItem)
        {
            var entry = this.data[flotItem.dataIndex];
            var tooltip = _.map(this.subType.tooltips, function(tooltip)
            {
                var value = entry[tooltip.key];

                var workoutTypeId = this._getSingleWorkoutTypeId();
                if(tooltip.units) {
                    value = TP.utils.conversion.formatUnitsValue(
                        tooltip.units,
                        value,
                        {defaultValue: "--", workoutTypeId: workoutTypeId }
                    );
                    value += " " + TP.utils.units.getUnitsLabel(tooltip.units, workoutTypeId);
                }

                return {
                    label: tooltip.label,
                    value: value
                };
            }, this);

            if(this.get("workoutSummaryDateGrouping") === 1)
            {
                tooltip.unshift({
                    value: moment(entry.date).format("L")
                });
            }
            else
            {
                tooltip.unshift({
                    value: moment(entry.date).format("L") + " - " +
                        moment(entry.date).add(6, "days").format("L")
                });
            }

            return tooltip;
        },

        getChartName: function()
        {
            return "Workout Summary";
        },

        _getSingleWorkoutTypeId: function()
        {
            var workoutTypeIds = this.get("workoutTypeIds");
            var workoutTypeId = workoutTypeIds && workoutTypeIds.length === 1 ? workoutTypeIds[0] : undefined;
            return workoutTypeId;
        },

        _validateWorkoutTypes: function()
        {
            if(!this.get("workoutTypeIds"))
            {
                this.set("workoutTypeIds", []);
            }
        },

        _adjustDateToWeek: function(date)
        {
            return moment(date).subtract(1, "day").day(0).add(1, "day").startOf("day");
        }

    });

    return WorkoutSummaryChart;

});
