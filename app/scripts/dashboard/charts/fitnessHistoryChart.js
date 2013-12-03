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
            this.waitingOn();
            this.model.buildChart().done(this._renderGrid).always(this.waitingOff); 
        },

        _renderGrid: function(data)
        {
            this.$(".chartTitle").text(this.model.get("title") || this.model.defaultTitle());
            this.$(".chartContainer").html(fitnessHistoryContentTemplate(data));
        }
    });

    var FitnessHistoryChart = Chart.extend(
    {
        settingsView: FitnessHistoryChartSettingsView,

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
            var postData =
            {
                workoutTypeIds: _.without(this.get("workoutTypeIds"), 0, "0", ""),
                peakType: this.get("peakType") || 1
            };


            var start, end;

            end = CalendarUtility.endMomentOfWeek(moment().subtract(1, "weeks")).format(CalendarUtility.idFormat);
            start = CalendarUtility.startMomentOfWeek(moment().subtract(5, "weeks")).format(CalendarUtility.idFormat);
            var weeklyReport = this.dataManager.fetchReport("fitnesshistory", start, end, _.extend({ group: 0 }, postData));

            end = moment().startOf("month").subtract(1, "day").format(CalendarUtility.idFormat);
            start = moment(end).subtract(11, "months").startOf("month").format(CalendarUtility.idFormat);
            var monthlyReport = this.dataManager.fetchReport("fitnesshistory", start, end, _.extend({ group: 1 }, postData));

            return $.when(weeklyReport, monthlyReport);
        },

        buildTooltipData: function(flotItem)
        {
            return null;
        },

        defaultTitle: function()
        {
            var title = TP.utils.translate("Fitness History: Peak ");
            title += this._getPeakUnits() + " (" + TP.utils.units.getUnitsLabel(this._getPeakUnits(), this._getWorkoutType()) + ") ";
            title += TP.utils.workout.types.getListOfNames(this.get("workoutTypeIds"), "All Workout Types");
            return title;
        },

        parseData: function(weekly, monthly)
        {
            var workoutType = this._getWorkoutType();
            var peakUnits = this._getPeakUnits();

            function format(units, value)
            {
                return TP.utils.conversion.formatUnitsValue(units, value, { workoutTypeId: workoutType });
            }

            function process(entry)
            {
                return {
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
                peakUnits: this._getPeakUnits(),
                byDistance: this.get("peakType") === 6,
                weeks:_.map(weekly, process).reverse(),
                months:_.map(monthly, process).reverse()
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
                6: "speed"
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
