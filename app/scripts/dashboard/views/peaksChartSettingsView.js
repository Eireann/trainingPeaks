define(
[
    "jqueryui/spinner",
    "underscore",
    "TP",
    "backbone",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    "hbs!dashboard/templates/peaksChartSettings"
],
function(
    spinner,
    _,
    TP,
    Backbone,
    ChartSettingsView,
    ChartDateOptionsView,
    peaksChartSettingsTemplate
    )
{
    var ChartWorkoutTypesView = TP.ItemView.extend({
        template: _.template("World")
    });

    var PeaksChartSettingsView = ChartSettingsView.extend({

        template:
        {
            type: "handlebars",
            template: peaksChartSettingsTemplate
        },

        modelEvents: {},

        events:
        {
            "change input": "_onInputsChanged"
        },

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

            this._addView(".dateOptionsRegion", new ChartDateOptionsView({
                model: this.model
            }));
            this._addView(".comparisonDateOptionsRegion", new ChartDateOptionsView({
                model: this.model,
                key: "comparisonDateOptions"
            }));
            this._addView(".workoutTypesRegion", new ChartWorkoutTypesView());

            this.children.call("render");

            console.log(this.model.attributes);
            this.$('input.auto[type="checkbox"]').each(function(i, el)
            {
                var $el = $(el);
                $el.attr("checked", self.model.get($el.attr("name")));
            });
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

            console.log(this.model.attributes);
        }
    });

    return PeaksChartSettingsView;

});
