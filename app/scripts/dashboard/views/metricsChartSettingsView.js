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
            "change input.auto": "_onInputsChanged"
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

            this._updateInputState();
        },

        _updateInputState: function()
        {
            var self = this;
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

    return MetricsChartSettingsView;
});

