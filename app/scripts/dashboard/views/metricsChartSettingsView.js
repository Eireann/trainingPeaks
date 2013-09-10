define(
[
    "underscore",
    "TP",
    "jquerySelectBox",
    "backbone",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    "hbs!dashboard/templates/metricsChartSettings"
],
function(
    _,
    TP,
    jquerySelectBox,
    Backbone,
    ChartSettingsView,
    DashboardDatePicker,
    metricsChartSettingsTemplate
    )
{

    var MetricsChartSettingsView = ChartSettingsView.extend({

        className: ChartSettingsView.prototype.className + " metricsChartSettings",

        template:
        {
            type: "handlebars",
            template: metricsChartSettingsTemplate
        },

        events: _.extend(
        {
            "change input.auto": "_onInputsChanged",
            "change select.autoSeries": "_onSeriesChanged"
        }, ChartSettingsView.prototype.events),

        onRender: function()
        {
            var self = this;

            this._addView(".dateOptionsRegion", new DashboardDatePicker({
                model: this.model
            }));

            this.children.call("render");

            this._updateInputsState();
            this._updateSeriesState();

            setImmediate(_.bind(this._setupSelects, this));
        },

        _setupSelects: function()
        {
            this.$("select").selectBoxIt({dynamicPositioning: true});
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

