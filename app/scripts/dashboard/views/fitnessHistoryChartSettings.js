define(
[
    "underscore",
    "backbone",
    "TP",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    "dashboard/views/chartWorkoutOptionsView",
    "hbs!templates/views/dashboard/fitnessHistoryChartSettings"
],
function(
    _,
    Backbone,
    TP,
    ChartSettingsView,
    DashboardDatePicker,
    ChartWorkoutOptionsView,
    fitnessHistoryChartSettingsTemplate
    )
{
    var fitnessHistoryChartSettingsView = ChartSettingsView.extend(
    {
        className: ChartSettingsView.prototype.className + " fitnessHistoryChartSettings",

        onRender: function()
        {
            var self = this;

            this._addView(".customSettings", fitnessHistoryChartSettingsTemplate({}));
            this._addView(".dateOptionsRegion", new DashboardDatePicker(
            {
                model: this.model
            }));

            this._addView(".workoutTypesRegion", new ChartWorkoutOptionsView(
            {
                model: this.model
            }));
            this._updateTitle();

            this.children.call("render");

        }

    });

    return fitnessHistoryChartSettingsView;

});
