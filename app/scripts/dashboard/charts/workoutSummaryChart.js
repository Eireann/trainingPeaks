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
        units: "duration"
    }, {
        label: "Completed Duration",
        key: "totalTimeActual",
        units: "duration"
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
        units: "duration"
    }, {
        label: "Completed Duration",
        key: "timeTotal",
        units: "duration"
    }];

    var WorkoutSummaryChart = Chart.extend({

        settingsView: DashboardSettingsView,

        subTypes: [{
            chartType: 10,
            endpoint: "workoutsummary",
            title: "Duration",
            series: [{
                key: "totalTimeActual",
                units: "duration"
            }],
            plannedSeries: [{
                key: "totalTimePlanned",
                units: "duration"
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
                key: "distancePlanned",
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
                colors: chartColors.workoutSummary.TSS,
                yaxisExtraInfo: { font: { color: chartColors.workoutSummary.TSS.dark } }
            }, {
                key: "averageIntensityFactorActual",
                units: "if",
                widthScale: 2 * 0.3,
                colors: chartColors.workoutSummary.IF,
                yaxisExtraInfo: { font: { color: chartColors.workoutSummary.IF.dark } }
            }],
            tooltips: [{
                label: "TSS",
                className: "TSS",
                key: "totalTrainingStressScoreActual",
                units: "tss"
            }, {
                label: "IF",
                className: "IF",
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
            prefiltered: true,
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
            prefiltered: true,
            series: [{
                key: "timeTotal",
                units: "duration"
            }],
            plannedSeries: [{
                key: "totalTimePlanned",
                units: "duration"
            }],
            tooltips: longestTooltips
        }],

        defaults: {
            workoutTypeIds: [],
            dateGrouping: 2, // 1: Day, 2: Week
            showPlanned: true
        },

        initialize: function(attributes, options)
        {
            var self = this;
            this.subType = _.find(this.subTypes, function(subType)
            {
                return subType.chartType === parseInt(this.get('chartType'), 10);
            }, this);
            this.subType.hasPlanned = this.subType.plannedSeries && this.subType.plannedSeries.length > 0;

            _.each(this.subType.plannedSeries, function(serie)
            {
                _.defaults(serie,
                {
                    color: chartColors.workoutSummary.planned
                });
            });

            this._validateWorkoutTypes();
        },

        _getColorForWorkoutType: function()
        {
            var workoutTypeIds = this.get('workoutTypeIds'),
                workoutTypeName;
            if (workoutTypeIds.length !== 1)
            {
                return chartColors.workoutSummary.bars;
            }
            else
            {
                workoutTypeName = TP.utils.workout.types.getNameById(workoutTypeIds[0]);
                return chartColors.gradients.workoutType[workoutTypeName.toLowerCase().replace(/[^a-z]/g,"")];
            }
        },

        fetchData: function()
        {
            var dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions"));
            var postData =
            {
                dateGrouping: this.get("dateGrouping") || 1
            };

            if(this.subType.prefiltered)
            {
                postData.workoutTypeIds = this.get("workoutTypeIds");
            }
            else
            {
                postData.groupByWorkoutType = this.get("workoutTypeIds").length !== 0;
            }

            return this.dataManager.fetchReport(this.subType.endpoint, dateOptions.startDate, dateOptions.endDate, postData);
        },

        defaultTitle: function()
        {
            var title;
            if(this.subType.onlyByWeek)
            {
                title = TP.utils.translate(this.subType.title + ": ");
            }
            else
            {
                var dateGrouping = this.get("dateGrouping") === 1 ? "Day" : "Week";
                title = TP.utils.translate(this.subType.title + " by " + dateGrouping + ": ");
            }
            title += TP.utils.workout.types.getListOfNames(this.get("workoutTypeIds"), "All Workout Types");

            return title;
        },

        parseData: function(data)
        {
            var self = this;
            data = this.data = this._preprocessData(data);

            // Calculate the bar width
            var dateGrouping = this.get("dateGrouping") === 1 ? "day" : "week";
            var barWidth = moment.duration(1, dateGrouping).valueOf() * 0.7 / this.subType.series.length;

            var series = _.map(this.subType.series, function(series, i)
            {
                var colors = series.colors || self._getColorForWorkoutType();

                return this._buildSeries(data, series.key, _.extend({
                    onlySeries: this.subType.series.length === 1,
                    color: colors.light,
                    bars: {
                        order: i,
                        barWidth: barWidth  * (series.widthScale || 1),
                        fillColor: { colors: [ colors.light, colors.dark ] }
                    }
                }, series));
            }, this);

            var plannedSeries = [];
            
            if(this.get("showPlanned")) {
                plannedSeries = _.map(this.subType.plannedSeries, function(series)
                {
                    return this._buildSeries(data, series.key, _.extend({
                        bars:
                        {
                            show: false
                        },
                        lines: {
                            show: true
                        }
                    }, series));
                }, this);
            }

            series = series.concat(plannedSeries);
            var yaxes = ChartingAxesBuilder.makeYaxes(series, {
                workoutTypeId: this._getSingleWorkoutTypeId(),
                min: 0
            });

            return {
                dataSeries: series,
                flotOptions: _.defaults({
                    bars:
                    {
                        show: true,
                        barWidth: barWidth,
                        lineWidth: 0.00000001 // 0 causes flot.orderBars to default to 2 for calculations... which aren't redone on resize.
                    },
                    shadowSize: 0,
                    yaxes: yaxes,
                    xaxis:
                    {
                        ticks: _.bind(this._generateTimeTicks, this),
                        tickFormatter: function(date)
                        {
                            return moment(date).format("MM/DD/YY");
                        },
                        color: "transparent"
                    }
                }, defaultFlotOptions.getBarOptions(null))
            };
        },

        _generateTimeTicks: function(axis)
        {
            var date = this._adjustDateToWeek(axis.min);
            var delta = moment.duration(axis.delta * 1.3).asDays();

            if(this.get("dateGrouping") === 1)
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

        _filterDataByWorkoutType: function(data)
        {
            var workoutTypeIds = _.map(this.get("workoutTypeIds"), function(id) { return parseInt(id, 10); });

            if(workoutTypeIds.length > 0)
            {
                data = _.filter(data, function(entry)
                {
                    return _.include(workoutTypeIds, parseInt(entry.workoutTypeId, 10));
                });
            }

            return data;
        },

        _augmentDataWithStartAndEndDates: function(data)
        {
            // Force start/end date to be included in chart.
            var dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions"));
            var dateGrouping = this.get("dateGrouping");
            if(dateGrouping === 2) // Week
            {
                dateOptions.startDate = this._adjustDateToWeek(dateOptions.startDate);
                dateOptions.endDate = this._adjustDateToWeek(dateOptions.endDate);
            }

            data.push({
                workoutDay: dateOptions.startDate
            });
            data.push({
                workoutDay: dateOptions.endDate
            });

            return data;
        },

        _preprocessData: function(data)
        {
            var dates;
            // Temporary patch for new API with wrapper object
            // TODO: Remove once API is consistent
            if(data && data.hasOwnProperty("data")) {
                dates = data.dateIndices;
                data = data.data;
            }

            if(!this.subType.prefiltered)
            {
                data = this._filterDataByWorkoutType(data);
            }

            var mergedData = {};

            // Ensure entries for all dates in range
            _.each(dates || [], function(date)
            {
                mergedData[moment(date).valueOf()] = {};
            });

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
                    if(key === "averageIntensityFactorActual")
                    {
                        value = _.reject(value, function(x) { return x === 0; });
                        value = _.reduce(value, function(a, b) { return a + b; }) / value.length;
                    }
                    else
                    {
                        value = _.reduce(value, function(a, b) { return a + b; });
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

            _.defaults(options, {
                colors: chartColors.gradients.heartRate
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
                    className: tooltip.className,
                    value: value
                };
            }, this);

            if(this.get("dateGrouping") === 1)
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
            return "Workout Summary Chart";
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
