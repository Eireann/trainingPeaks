define(
[
    "underscore",
    "TP",
    "backbone",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    // "dashboard/views/chartMetricOptionsView",
    "hbs!dashboard/templates/metricsChartSettings"
],
function(
    _,
    TP,
    Backbone,
    ChartSettingsView,
    DashboardDatePicker,
    // ChartMetricOptionsView,
    metricsChartSettingsTemplate
    )
{

    var MetricsChartSettingsView = ChartSettingsView.extend({

        template:
        {
            type: "handlebars",
            template: metricsChartSettingsTemplate
        },

        events: _.extend(
        {
            "change input.auto": "_onInputsChanged",
            "change select.auto": "_onSelectsChanged"
        }, ChartSettingsView.prototype.events),

        onRender: function()
        {
            var self = this;

            this._addView(".dateOptionsRegion", new DashboardDatePicker({
                model: this.model
            }));

//             this._addView(".metricTypesRegion", new ChartMetricOptionsView({
//                 model: this.model
//             }));

            this.children.call("render");

            this._updateInputsState();
            this._updateSelectsState();
        },

        _updateInputsState: function()
        {
            var self = this;
            this.$('input.auto[type="checkbox"]').each(function(i, el)
            {
                var $el = $(el);
                $el.attr("checked", self.model.get($el.attr("name")));
            });
        },

        _updateSelectsState: function()
        {
            var self = this;
            this.$('select.auto').each(function(i, el)
            {
                var $el = $(el);
                $el.val(self.model.get($el.attr("name")));
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
        },

        _onSelectsChanged: function()
        {
            var self = this;

            this.$('select.auto').each(function(i, el)
            {
                var $el = $(el);
                self.model.set($el.attr("name"), $el.val());
            });
        },

        serializeData: function()
        {
            var original = MetricsChartSettingsView.__super__.serializeData.apply(this, arguments);
            return _.extend({
                metricTypes: this.model.metricTypes
            }, original);
        }
    });

    return MetricsChartSettingsView;
});

