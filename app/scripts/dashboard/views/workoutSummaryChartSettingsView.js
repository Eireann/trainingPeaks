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
            "change input[type=radio].auto": "_onRadioInputsChanged"
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

        _onRadioInputsChanged: function()
        {
            var self = this;

            this.$('input.auto[type="radio"]:checked').each(function(i, el)
            {
                var $el = $(el);
                self.model.set($el.attr("name"), parseInt($el.val(), 10));
            });
        },

        serializeData: function()
        {
            var data = WorkoutSummaryChartSettingsView.__super__.serializeData.apply(this, arguments);
            data.subType = this.model.subType;
            return data;
        }
    });

    return WorkoutSummaryChartSettingsView;

});
