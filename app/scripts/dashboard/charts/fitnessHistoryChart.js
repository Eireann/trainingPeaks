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
    "views/dashboard/chartUtils",
    "dashboard/views/fitnessHistoryChartSettings"
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
    DashboardChartUtils,
    FitnessHistoryChartSettingsView     
)
{
    var FitnessHistoryChart = Chart.extend(
    {
        settingsView: FitnessHistoryChartSettingsView,

        defaults:
        {
            workoutTypeIds: []
        },

        initialize: function(attributes, options)
        {
            this._validateWorkoutTypes();
        },

        fetchData: function()
        {
            this.dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions"));
            var postData =
            {
                workoutTypeIds: _.without(this.get("workoutTypeIds"), 0, "0", ""),
                peakType: this.get("peakTypeOptions"),
                group: 1 
            };

            var weeklyReport = this.dataManager.fetchReport("fitnesshistory", this.dateOptions.startDate, this.dateOptions.endDate, postData);

            postData.group = 2;

            var monthlyReport = this.dataManager.fetchReport("fitnesshistory", this.dateOptions.startDate, this.dateOptions.endDate, postData);

            return $.when(weeklyReport, monthlyReport);
        },

        buildTooltipData: function(flotItem)
        {
            return null;
        },

        defaultTitle: function()
        {
            var title = TP.utils.translate("Fitness History ");
            title += TP.utils.workout.types.getListOfNames(this.get("workoutTypeIds"), "All Workout Types");
            return title;
        },

        parseData: function(data)
        {
            this._data = data;

            return null;
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
        }

    });

    return FitnessHistoryChart;
});
