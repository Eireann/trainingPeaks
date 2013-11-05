define(
[
    "underscore",
    "moment",
    "TP",
    "framework/chart",
    "utilities/charting/jquery.flot.stack",
    "utilities/charting/chartColors",
    "utilities/charting/flotOptions",
    "views/dashboard/chartUtils",
    "shared/utilities/chartingAxesBuilder",
    "dashboard/views/workoutSummaryChartSettingsView"
],
function(
    _,
    moment,
    TP,
    Chart,
    flotStack,
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


    function buildOrderedDataPoints(data, key, offset)
    { 
        var points = _.map(data, function(entry)
        {
            return [entry.date + offset, entry[key] || 0];
        });

        return _.sortBy(points, 0);
    }

    function buildSeriesOptionsWithoutPlannedValues(data, subTypeOptions, barWidth, defaultColors)
    {
        return _.map(subTypeOptions.series, function(series, i)
        {
            var colors = series.colors || defaultColors;

            // offset to account for tss/if bars side by side
            var offset = subTypeOptions.series.length === 1 ? -(barWidth / 2) : 0;
            
            var orderedPoints = buildOrderedDataPoints(data, series.key, offset);

            var options = _.extend({
                color: colors.light,
                bars: {
                    order: i,
                    barWidth: barWidth  * (series.widthScale || 1),
                    fillColor: { colors: [ colors.light, colors.dark ] }
                }
            }, series);

            return _.extend({ data: orderedPoints }, options);

        }, this);
    }

    function buildSeriesOptionsWithPlannedValues(data, subTypeOptions, barWidth, colors)
    {
        // offset to account for tss/if bars side by side
        var offset = -(barWidth / 2);

        var plannedValues =  buildOrderedDataPoints(data, subTypeOptions.plannedSeries[0].key, offset);
        var completedValues =  buildOrderedDataPoints(data, subTypeOptions.series[0].key, offset);

        // charting y axis builder needs the series units
        var completedSeries = _.defaults({
            data: [],
            color: colors.completed.light,
            bars: {
                fillColor: { colors: [colors.completed.light, colors.completed.dark] }
            }
        }, subTypeOptions.series[0]);

        var plannedGreaterThanCompletedSeries = {
            data: [],
            color: colors.plannedGreaterThanCompleted.light,
            bars: {
                fillColor: { colors: [colors.plannedGreaterThanCompleted.light, colors.plannedGreaterThanCompleted.dark] }
            },
            yaxis: 1 // share the first y axis
        };

        var completedGreaterThanPlannedSeries = {
            data: [],
            color: colors.completedGreaterThanPlanned.light,
            bars: {
                fillColor: { colors: [colors.completedGreaterThanPlanned.light, colors.completedGreaterThanPlanned.dark] }
            },
            yaxis: 1 // share the first y axis
        };

        _.each(plannedValues, function(plannedDataPoint, i)
        {
            var xIndex = plannedDataPoint[0];
            var plannedValue = plannedDataPoint[1];
            var completedValue = completedValues[i][1];

            // round comparison values to account for slight rounding differences
            var oneSignificantUnit;
            if(this.units === "distance")
            {
                oneSignificantUnit = 1; // one meter
            }
            else
            {
                oneSignificantUnit = 1 / 3600; // one second
            }

            // each series should have either a value or 0,
            // but never null, 
            // or flot stack and flot mouseover calculations get confused
            if((plannedValue - completedValue) >= oneSignificantUnit)
            {
                completedSeries.data.push([xIndex, completedValue]);
                plannedGreaterThanCompletedSeries.data.push([xIndex, plannedValue - completedValue]);
                completedGreaterThanPlannedSeries.data.push([xIndex, 0]);
            }
            else if((completedValue - plannedValue) >= oneSignificantUnit)
            {
                completedSeries.data.push([xIndex, plannedValue]);
                plannedGreaterThanCompletedSeries.data.push([xIndex, 0]);
                completedGreaterThanPlannedSeries.data.push([xIndex, completedValue - plannedValue]);
            }
            else if(completedValue >= oneSignificantUnit)
            {
                completedSeries.data.push([xIndex, completedValue]);
                plannedGreaterThanCompletedSeries.data.push([xIndex, 0]); 
                completedGreaterThanPlannedSeries.data.push([xIndex, 0]);
            }
            else
            {
                completedSeries.data.push([xIndex, 0]);
                plannedGreaterThanCompletedSeries.data.push([xIndex, 0]); 
                completedGreaterThanPlannedSeries.data.push([xIndex, 0]);
            }
        }, subTypeOptions.series[0]);

        return [completedSeries, plannedGreaterThanCompletedSeries, completedGreaterThanPlannedSeries ];
    }

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
                yaxisExtraInfo:
                {
                    font:
                    {
                        color: chartColors.workoutSummary.TSS.dark,
                        family: "HelveticaNeueW01-55Roma",             
                        size: "9"
                    }
                }
            }, {
                key: "averageIntensityFactorActual",
                units: "if",
                widthScale: 2 * 0.3,
                colors: chartColors.workoutSummary.IF,
                yaxisExtraInfo:
                {
                    font:
                    {
                        color: chartColors.workoutSummary.IF.dark,
                        family: "HelveticaNeueW01-55Roma",             
                        size: "9"
                    }
                }
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
            // The KJ by Week chart never had this setting,
            // leading to values that are inconsistently handled by the code
            // Default anything not explicitly set to "By Day" to "By Week"
            if(this.get("dateGrouping") !== 1)
            {
                this.set("dateGrouping", 2);
            }

            this.subType = _.find(this.subTypes, function(subType)
            {
                return subType.chartType === parseInt(this.get('chartType'), 10);
            }, this);
            this.subType.hasPlanned = this.subType.plannedSeries && this.subType.plannedSeries.length > 0;
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

        _getColorForWorkoutTypeWithPlanned: function()
        {
            var workoutTypeIds = this.get('workoutTypeIds'),
                workoutTypeName;
            if (workoutTypeIds.length !== 1)
            {
                return chartColors.workoutSummary.plannedCompleted.defaults;
            }
            else
            {
                workoutTypeName = TP.utils.workout.types.getNameById(workoutTypeIds[0]);
                return _.defaults(chartColors.workoutSummary.plannedCompleted[workoutTypeName.toLowerCase().replace(/[^a-z]/g,"")], chartColors.workoutSummary.plannedCompleted.defaults);
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
            data = this.data = this._preprocessData(data);

            // Calculate the bar width
            var dateGrouping = this.get("dateGrouping") === 1 ? "day" : "week";
            var barWidth = moment.duration(1, dateGrouping).valueOf() * 0.7 / this.subType.series.length;

            var flotOptions = _.defaults({
                bars:
                {
                    show: true,
                    barWidth: barWidth,
                    lineWidth: 0.00000001 // 0 causes flot.orderBars to default to 2 for calculations... which aren't redone on resize.
                },
                shadowSize: 0,
                xaxis:
                {
                    ticks: _.bind(this._generateTimeTicks, this),
                    tickFormatter: function(date)
                    {
                        return TP.utils.datetime.format(date); 
                    },
                    color: "transparent"
                }
            }, defaultFlotOptions.getBarOptions(null));

            if(this.subType.hasPlanned && this.get("showPlanned"))
            {
                series = buildSeriesOptionsWithPlannedValues(data, this.subType, barWidth, this._getColorForWorkoutTypeWithPlanned());
                flotOptions.series.stack = true;
            }
            else
            { 
                series = buildSeriesOptionsWithoutPlannedValues(data, this.subType, barWidth, this._getColorForWorkoutType());
            }

            flotOptions.yaxes = ChartingAxesBuilder.makeYaxes(series, {
                workoutTypeId: this._getSingleWorkoutTypeId(),
                min: 0
            });

            return {
                dataSeries: series,
                flotOptions: flotOptions 
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
                    value: TP.utils.datetime.format(entry.date)
                });
            }
            else
            {
                tooltip.unshift({
                    value: TP.utils.datetime.format(entry.date) + " - " +
                        TP.utils.datetime.format(moment(entry.date).add(6, "days"))
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
