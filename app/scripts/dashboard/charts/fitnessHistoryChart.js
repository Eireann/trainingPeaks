define(
[
    "jquery",
    "underscore",
    "moment",
    "TP",
    "framework/chart",
    "utilities/charting/jquery.flot.stack",
    "utilities/charting/chartColors",
    "utilities/charting/flotOptions",
    "utilities/color",
    "shared/utilities/calendarUtility",
    "views/dashboard/chartUtils",
    "dashboard/views/fitnessHistoryChartSettings",
    "hbs!dashboard/templates/fitnessHistoryPodTemplate",
    "hbs!dashboard/templates/fitnessHistoryContentTemplate"
],
function(
    $,
    _,
    moment,
    TP,
    Chart,
    flotStack,
    chartColors,
    defaultFlotOptions,
    colorUtils,
    CalendarUtility,
    DashboardChartUtils,
    FitnessHistoryChartSettingsView,
    fitnessHistoryPodTemplate,
    fitnessHistoryContentTemplate
)
{
    var FitnessHistoryView = TP.ItemView.extend(
    {
        modelEvents: {},

        initialize: function()
        {
            _.bindAll(this, "_renderGrid", "waitingOff");
        },

        render: function()
        {
            var self = this;

            this.waitingOn();

            this.xhrs = this.model.fetchData();

            _.each(this.xhrs, function(xhr, key)
            {
                xhr.done(function(data)
                {
                    self._renderGrid(self.model.parseData(key, data));
                    self.waitingOff();
                });
            });
        },

        _renderGrid: function(data)
        {
            this.$(".podTitle").text(this.model.get("title") || this.model.defaultTitle());
            this.$(".podContent").html(fitnessHistoryContentTemplate(data));
        }
    });

    var FitnessHistoryChart = Chart.extend(
    {
        settingsView: FitnessHistoryChartSettingsView,

        template:
        {
            type: "handlebars",
            template: fitnessHistoryPodTemplate
        },

        defaults:
        {
            workoutTypeIds: [],
            peakType: 1
        },

        createContentView: function(options)
        {
            return new FitnessHistoryView(options);
        },

        initialize: function(attributes, options)
        {
            this._validateWorkoutTypes();
        },

        fetchData: function()
        {
            this.data = { weeks: [], months: [] };
            var postData =
            {
                workoutTypeIds: _.without(this.get("workoutTypeIds"), 0, "0", ""),
                peakType: this.get("peakType") || 1
            };


            var week, start, end;

            week = CalendarUtility.weekForDate();
            start = CalendarUtility.startMomentOfWeek(moment(week).subtract(3, "weeks"));
            end = CalendarUtility.endMomentOfWeek(week);
            var weeklyReport = this.dataManager.fetchReport("fitnesshistory", start, end, _.extend({ group: 0 }, postData));

            start = moment().subtract(12, "months").startOf("month");
            end = moment().endOf("month");
            var monthlyReport = this.dataManager.fetchReport("fitnesshistory", start, end, _.extend({ group: 1 }, postData));

            return { weeks: weeklyReport, months: monthlyReport };
        },

        buildTooltipData: function(flotItem)
        {
            return null;
        },

        defaultTitle: function()
        {
            var title = TP.utils.translate("Fitness History: Peak ");
            title += "Peak " + this._getPeakName();

            var units = TP.utils.units.getUnitsLabel(this._getPeakUnits(), this._getWorkoutType());
            title += " (" + units + ") - ";
            title += TP.utils.workout.types.getListOfNames(this.get("workoutTypeIds"), "All Workout Types");
            return title;
        },

        parseData: function(period, data)
        {
            this.data[period] = data;

            var workoutType = this._getWorkoutType();
            var peakUnits = this._getPeakUnits();

            function format(units, value)
            {
                return TP.utils.conversion.formatUnitsValue(units, value, { workoutTypeId: workoutType, defaultValue: "--" });
            }

            function process(entry)
            {
                return {
                    incomplete: moment(entry.endDate) > moment(),
                    startDate: entry.startDate,
                    duration: format("duration", entry.totalDuration),
                    distance: format("distance", entry.totalDistance),
                    tss: format("tss", entry.totalTSS),
                    peak01: format(peakUnits, entry.peak01),
                    peak02: format(peakUnits, entry.peak02),
                    peak03: format(peakUnits, entry.peak03),
                    peak04: format(peakUnits, entry.peak04),
                    peak05: format(peakUnits, entry.peak05)
                };
            }

            return {
                workoutType: workoutType,
                peakUnits: this._getPeakUnits(),
                byDistance: this.get("peakType") === 6,
                weeks: _.map(this.data.weeks, process).reverse(),
                months: _.map(this.data.months, process).reverse()
            };
        },

        getChartName: function()
        {
            return "Fitness History";
        },

        _validateWorkoutTypes: function()
        {
            if(!this.get("workoutTypeIds"))
            {
                this.set("workoutTypeIds", []);
            }
        },
        
        _getPeakUnits: function()
        {
            var type = this.get("peakType");
            var types =
            {
                1: "heartrate",
                2: "speed",
                3: "pace",
                4: "power",
                5: "cadence",
                6: "pace"
            };

            return types[type];
        },

        _getPeakName: function()
        {
            var type = this.get("peakType");
            var types =
            {
                1: "Heart Rate",
                2: "Speed",
                3: "Pace",
                4: "Power",
                5: "Cadence",
                6: "Pace by Distance"
            };

            return types[type];
        },

        _getWorkoutType: function()
        {
            var types = this.get("workoutTypeIds");
            if(types.length === 1) return _.first(types);
            return 0;
        }

    });

    return FitnessHistoryChart;
});
