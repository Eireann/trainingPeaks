define(
[
    "jqueryui/spinner",
    "underscore",
    "TP",
    "backbone",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    "dashboard/views/chartWorkoutOptionsView",
    "hbs!dashboard/templates/peaksChartSettings"
],
function(
    spinner,
    _,
    TP,
    Backbone,
    ChartSettingsView,
    DashboardDatePicker,
    ChartWorkoutOptionsView,
    peaksChartSettingsTemplate
    )
{

    var PeaksChartSettingsView = ChartSettingsView.extend({

        template:
        {
            type: "handlebars",
            template: peaksChartSettingsTemplate
        },

        events: _.extend(
        {
            "change input": "_onInputsChanged"
        }, ChartSettingsView.prototype.events),

        ui: {
            useComparison: ".useComparison"
        },

        onRender: function()
        {
            var self = this;

            this._addView(".dateOptionsRegion", new DashboardDatePicker({
                model: this.model
            }));
            this._addView(".comparisonDateOptionsRegion", new DashboardDatePicker({
                model: this.model,
                key: "comparisonDateOptions"
            }));
            this._addView(".workoutTypesRegion", new ChartWorkoutOptionsView({
                model: this.model
            }));

            this.children.call("render");

            this.$('input.auto[type="checkbox"]').each(function(i, el)
            {
                var $el = $(el);
                $el.attr("checked", self.model.get($el.attr("name")));
            });
        },

        _onInputsChanged: function()
        {
            var self = this;

            this.$('input.auto[type="checkbox"]').each(function(i, el)
            {
                var $el = $(el);
                self.model.set($el.attr("name"), $el.prop("checked"));
            });
        }
    });

    return PeaksChartSettingsView;

});