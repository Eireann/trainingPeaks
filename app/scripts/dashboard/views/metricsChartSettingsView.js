define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "TP",
    "backbone",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    "hbs!dashboard/templates/metricsChartSettings"
],
function(
    $,
    _,
    setImmediate,
    TP,
    Backbone,
    ChartSettingsView,
    DashboardDatePicker,
    metricsChartSettingsTemplate
    )
{

    var MetricsChartSettingsView = ChartSettingsView.extend({

        className: ChartSettingsView.prototype.className + " metricsChartSettings",

        events: _.extend(
        {
            "change input.auto": "_onInputsChanged",
            "change select.autoSeries": "_onSeriesChanged"
        }, ChartSettingsView.prototype.events),

        onRender: function()
        {
            var self = this;

            this._addView(".customSettings", metricsChartSettingsTemplate(this.serializeData()));
            this._addView(".dateOptionsRegion", new DashboardDatePicker({
                model: this.model
            }));
            this._updateTitle();
            this.children.call("render");

            this._updateInputsState();
            this._updateSeriesState();
        },

        _updateInputsState: function()
        {
            var self = this;
            this.$('input.auto[type="checkbox"]').each(function(i, el)
            {
                var $el = $(el);
                $el.attr("checked", self.model.get($el.attr("name")));
            });

            this.$('input.auto[type="text"]').each(function(i, el)
            {
                var $el = $(el);
                $el.val(self.model.get($el.attr("name")));
            });
        },

        _updateSeriesState: function()
        {
            var dataFields = this.model.get("dataFields");
            this.$('select.autoSeries').each(function(i, el)
            {
                var $el = $(el);
                $el.val(dataFields[i]);
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

            this.$('input.auto[type="text"]').each(function(i, el)
            {
                var $el = $(el);
                self.model.set($el.attr("name"), $el.val());
            });
        },

        _onSeriesChanged: function()
        {
            var metricTypeIds = this.$('select.autoSeries').map(function(i, el)
            {
                return $(el).val();
            }).get();
            this.model.set("dataFields", metricTypeIds);
        },

        serializeData: function()
        {
            var original = MetricsChartSettingsView.__super__.serializeData.apply(this, arguments);
            var filteredMetricTypes = _.reject(this.model.metricTypes, function(type)
            {
                return type.chartable === false;
            });
            return _.extend({
                metricTypes: _.sortBy(filteredMetricTypes, "label")
            }, original);
        }
    });

    return MetricsChartSettingsView;
});

