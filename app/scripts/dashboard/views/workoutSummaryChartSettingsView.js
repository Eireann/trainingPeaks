define(
[
    "underscore",
    "TP",
    "backbone",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    "dashboard/views/chartWorkoutOptionsView",
    "hbs!dashboard/templates/workoutSummaryChartSettings"
],
function(
    _,
    TP,
    Backbone,
    ChartSettingsView,
    DashboardDatePicker,
    ChartWorkoutOptionsView,
    workoutSummaryChartSettingsTemplate
    )
{

    var WorkoutSummaryChartSettingsView = ChartSettingsView.extend({

        className: ChartSettingsView.prototype.className + " workoutSummaryChartSettings",

        template:
        {
            type: "handlebars",
            template: workoutSummaryChartSettingsTemplate
        },

        events: _.extend(
        {
            "change input.auto": "_onInputsChanged"
        }, ChartSettingsView.prototype.events),

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

            this.$('input.auto[type="checkbox"]').each(function(i, el)
            {
                var $el = $(el);
                $el.attr("checked", self.model.get($el.attr("name")));
            });

            this.$('input.auto[type="radio"]').each(function(i, el)
            {
                var $el = $(el);
                $el.val([self.model.get($el.attr("name"))]);
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

            
            this.$('input.auto[type="radio"]:checked').each(function(i, el)
            {
                var $el = $(el);
                self.model.set($el.attr("name"), parseInt($el.val(), 10));
            });
        },
    });

    return WorkoutSummaryChartSettingsView;

});
