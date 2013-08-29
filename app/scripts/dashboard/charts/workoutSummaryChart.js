define(
[
    "TP",
    "framework/chart",
    "utilities/charting/chartColors",
    "utilities/charting/flotOptions",
    "views/dashboard/chartUtils",
    "dashboard/views/chartSettingsView"
],
function(
    TP,
    Chart,
    chartColors,
    defaultFlotOptions,
    DashboardChartUtils,
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

    var WorkoutSummaryChart = Chart.extend({

        settingsView: DashboardSettingsView,

        subTypes: [{
            chartType: 10,
            title: "Durration",
            series: [{
                key: "totalTimeActual"
            }],
            plannedSeries: [{
                key: "totalTimePlanned"
            }],
            tooltips: distanceDurationTooltips
        }, {
            chartType: 11,
            title: "Distance",
            series: [{
                key: "distanceActual"
            }],
            plannedSeries: [{
                key: "disntancePlanned"
            }],
            tooltips: distanceDurationTooltips
        }, {
            chartType: 23,
            title: "TSS",
            series: [{
                key: "totalTrainingStressScoreActual",
                widthScale: 2 * 0.7,
                options: {
                    color: chartColors.pmcColors.TSS,
                    yaxis: 1
                }
            }, {
                key: "averageIntensityFactorActual",
                widthScale: 2 * 0.3,
                options: {
                    color: chartColors.pmcColors.IF,
                    yaxis: 2
                }
            }],
            tooltips: [{
                label: "TSS",
                key: "totalTrainingStressScoreActual"
            }, {
                label: "IF",
                key: "averageIntensityFactorActual"
            }]
        }, {
            chartType: 37,
            title: "Elevation Gain",
            series: [{
                key: "totalElevationGainActual"
            }],
            tooltips: [{
                label: "Elevation Gain",
                key: "totalElevationGainActual",
                units: "elevation"
            }]
        }],

        defaults: {
            workoutTypeIds: [],
            workoutSummaryDateGrouping: 2, // 1: Day, 2: Week
            showPlanned: true,
            units: ""
        },

        initialize: function(attributes, options)
        {
            this.subType = _.find(this.subTypes, function(subType)
            {
                return subType.chartType === parseInt(this.get('chartType'), 10);
            }, this);
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
            return this.dataManager.fetchReport("workoutsummary", dateOptions.startDate, dateOptions.endDate, postData);
        },

        updateChartTitle: function()
        {
            var dateGrouping = this.get("workoutSummaryDateGrouping") === 1 ? "Day" : "Week";
            var title = TP.utils.translate(this.subType.title + " by " + dateGrouping + ": ");
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
                }, series.options));
            }, this);

            var plannedSeries = _.map(this.subType.plannedSeries, function(series)
            {
                return this._buildSeries(data, series.key, _.extend({bars: {show: false}, lines: {show: true}}, series.options));
            }, this);

            console.log(series);

            return {
                dataSeries: series.concat(plannedSeries),
                flotOptions: _.defaults({
                    bars:
                    {
                        show: true,
                        lineWidht: 1,
                        barWidth: barWidth,
                        lineWidth: 0.00000001 // 0 causes flot.orderBars to default to 2 for calculations... which aren't redone on resize.
                    },
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
            var workoutTypeIds = this.get("workoutTypeIds");
            if(workoutTypeIds.length > 0)
            {
                data = _.filter(data, function(entry)
                {
                    return _.include(workoutTypeIds, entry.workoutTypeId);
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
                var x = moment(entry.workoutDay || entry.startWorkoutDate).valueOf();
                if (mergedData[x] === undefined)
                {
                    mergedData[x] = {};
                }

                _.each(entry, function(value, key)
                {
                    mergedData[x][key] = (mergedData[x][key] || 0) + value;
                });
            });

            _.each(mergedData, function(value, key) { value.date = parseInt(key, 10); });

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
                    value += TP.utils.units.getUnitsLabel(tooltip.units, workoutTypeId);
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
