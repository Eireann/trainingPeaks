define(
[
    "underscore",
    "backbone",
    "TP",
    "shared/utilities/formUtility",
    "dashboard/views/chartSettingsView",
    "dashboard/views/chartWorkoutOptionsView",
    "hbs!templates/views/dashboard/fitnessHistoryChartSettings"
],
function(
    _,
    Backbone,
    TP,
    FormUtility,
    ChartSettingsView,
    ChartWorkoutOptionsView,
    fitnessHistoryChartSettingsTemplate
    )
{
    var fitnessHistoryChartSettingsView = ChartSettingsView.extend(
    {
        className: ChartSettingsView.prototype.className + " fitnessHistoryChartSettings",

        onRender: function()
        {
            this._addView(".customSettings", fitnessHistoryChartSettingsTemplate({}));

            this._addView(".workoutTypesRegion", new ChartWorkoutOptionsView(
            {
                model: this.model
            }));
            this._updateTitle();

            this.children.call("render");

            this.$("select").selectBoxIt();

            FormUtility.bindFormToModel(this.$el, this.model, { filterSelector: "[data-scope='customSettings']" });
        }

    });

    return fitnessHistoryChartSettingsView;

});
