define(
[
    "setImmediate",
    "jquerySelectBox",
    "underscore",
    "TP",
    "dashboard/views/chartSettingsView",
    "views/dashboard/dashboardDatePicker",
    "hbs!templates/views/dashboard/fitnessSummaryChartSettings"
],
function(
    setImmediate,    
    jquerySelectBox,
    _,
    TP,
    ChartSettingsView,
    DashboardDatePicker,
    fitnessSummaryChartSettingsTemplate
    )
{
    var FitnessSummaryChartSettings = ChartSettingsView.extend({

        className: ChartSettingsView.className + " dashboardChartSettings fitnessSummaryChartSettings",

        template:
        {
            type: "handlebars",
            template: fitnessSummaryChartSettingsTemplate
        },

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
            this.selectBoxIt();
            this._addView(".dateOptionsRegion", new DashboardDatePicker({
                model: this.model
            }));

            this.children.call("render");
        },

        selectBoxIt: function()
        {
            var self = this;
            setImmediate(function()
            {
                self.$("select.summaryType").selectBoxIt();
            });
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
