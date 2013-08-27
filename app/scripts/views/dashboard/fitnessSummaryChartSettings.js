define(
[
    "setImmediate",
    "jquerySelectBox",
    "underscore",
    "TP",
    "./dashboardChartSettingsBase",
    "hbs!templates/views/dashboard/fitnessSummaryChartSettings"
],
function(
    setImmediate,    
    jquerySelectBox,
    _,
    TP,
    DashboardChartSettingsBase,
    fitnessSummaryChartSettingsTemplate
    )
{
    var FitnessSummaryChartSettings = {

        className: DashboardChartSettingsBase.className + " fitnessSummaryChartSettings",

        template:
        {
            type: "handlebars",
            template: fitnessSummaryChartSettingsTemplate
        },

        events: _.extend({}, DashboardChartSettingsBase.events, {
            "change select.summaryType": "onSummaryTypeChange"
        }),

        onSummaryTypeChange: function(e)
        {
            var typeId = Number(this.$("select.summaryType").val());
            this.setSetting("summaryType", typeId);
        },

        initialize: function(options)
        {
            DashboardChartSettingsBase.initialize.call(this, options);
            this.summaryTypes = options.summaryTypes || options.model.summaryTypes;
            this.on("render", this.selectBoxIt, this);
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
            var data = DashboardChartSettingsBase.serializeData.call(this);
            data.summaryTypeList = [];

            var selectedTypeId = Number(this.getSetting("summaryType"));

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

    };

    FitnessSummaryChartSettings = _.extend({}, DashboardChartSettingsBase, FitnessSummaryChartSettings);
    return TP.ItemView.extend(FitnessSummaryChartSettings);

});