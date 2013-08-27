define(
[
    "underscore",
    "backbone",
    "TP",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    "dashboard/views/chartWorkoutOptionsView",
    "hbs!templates/views/dashboard/timeInZonesChartSettings"
],
function(
    _,
    Backbone,
    TP,
    ChartSettingsView,
    DashboardDatePicker,
    ChartWorkoutOptionsView,
    timeInZonesChartSettingsTemplate
    )
{
    var TimeInZonesChartSettingsView = ChartSettingsView.extend({

        className: ChartSettingsView.prototype.className + " timeInZonesChartSettings",

        template:
        {
            type: "handlebars",
            template: timeInZonesChartSettingsTemplate
        },

        onRender: function()
        {
            var self = this;

            this._addView(".dateOptionsRegion", new DashboardDatePicker({
                model: this.model
            }));

            this._addView(".workoutTypesRegion", new ChartWorkoutOptionsView({
                model: this.model
            }));

            this.children.call("render");

        }

    });

    return TimeInZonesChartSettingsView;

});