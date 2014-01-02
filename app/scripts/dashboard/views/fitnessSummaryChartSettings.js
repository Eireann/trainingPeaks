define(
[
    "setImmediate",
    "underscore",
    "TP",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    "hbs!dashboard/templates/fitnessSummaryChartSettings"
],
function(
    setImmediate,    
    _,
    TP,
    ChartSettingsView,
    DashboardDatePicker,
    fitnessSummaryChartSettingsTemplate
    )
{
    var FitnessSummaryChartSettings = ChartSettingsView.extend({

        className: ChartSettingsView.className + " dashboardChartSettings fitnessSummaryChartSettings",

        events: _.extend({}, ChartSettingsView.prototype.events, {
            "change select.summaryType": "onSummaryTypeChange"
        }),

        onSummaryTypeChange: function(e)
        {
            var typeId = Number(this.$("select.summaryType").val());
            this.model.set("summaryType", typeId);
        },

        initialize: function(options)
        {
            FitnessSummaryChartSettings.__super__.initialize.apply(this, arguments);
            this.summaryTypes = options.summaryTypes || options.model.summaryTypes;
        },

        onRender: function()
        {
            this._addView(".customSettings", fitnessSummaryChartSettingsTemplate(this.serializeData()));
            this._addView(".dateOptionsRegion", new DashboardDatePicker({
                model: this.model
            }));

            this.children.call("render");
        },

        serializeData: function()
        {
            var data = FitnessSummaryChartSettings.__super__.serializeData.apply(this, arguments);
            data.summaryTypeList = [];

            var selectedTypeId = Number(this.model.get("summaryType"));

            _.each(this.summaryTypes, function(summaryType)
            {
                var type = _.clone(summaryType);
                if(type.id === selectedTypeId)
                {
                    type.selected = true;
                }
                data.summaryTypeList.push(type);
            });

            return data;
        }

    });

    return FitnessSummaryChartSettings;

});
