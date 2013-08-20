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

        modelEvents: {},

        events: _.extend(
        {
            "change input": "_onInputsChanged"
        }, ChartSettingsView.prototype.events),

        ui: {
            useComparison: ".useComparison"
        },

        initialize: function()
        {
            PeaksChartSettingsView.__super__.initialize.apply(this, arguments);
            this.children = new Backbone.ChildViewContainer();
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
        
        onShow: function()
        {
            this.children.call("show");
        },

        onClose: function()
        {
            this.children.call("close");
        },

        _addView: function(selector, view)
        {
            this.$(selector).append(view.$el);
            this.children.add(view);
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
