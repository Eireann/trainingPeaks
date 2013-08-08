define(
[
    "jqueryui/datepicker",
    "jqueryui/spinner",
    "jquerySelectBox",
    "underscore",
    "TP",
    "./dashboardDatePicker",
    "./chartUtils",
    "hbs!templates/views/dashboard/dashboardHeader"
],
function (datepicker, spinner, jquerySelectBox, _, TP, DashboardDatePicker, chartUtils, dashboardHeaderTemplate)
{
    var DashboardHeaderView =
    {

        className: "frameworkHeaderView",

        template:
        {
            type: "handlebars",
            template: dashboardHeaderTemplate
        },

        events:
        {
            "click .applyDates": "applyDates"
        },

        initialize: function (options)
        {
            this.settingsKey = "settings.dashboard.dateOptions";
            this.datepickerView = new DashboardDatePicker({ model: this.model, settingsKey: "settings.dashboard", includeGlobalOption: false });
            this.on("user:loaded", this.setDefaultDateSettings, this);
            this.setDefaultDateSettings();
        },

        setDefaultDateSettings: function()
        {
            var defaultDateOption = chartUtils.chartDateOptions.LAST_90_DAYS_AND_NEXT_21_DAYS.id;
            var defaultSettings = { startDate: null, endDate: null, quickDateSelectOption: defaultDateOption };
            var mergedSettings = _.extend(defaultSettings, this.model.get(this.settingsKey));
            if(!mergedSettings.quickDateSelectOption)
            {
                mergedSettings.quickDateSelectOption = defaultDateOption;
            }
            this.model.set(this.settingsKey, mergedSettings, { silent: true });
        },

        onClose: function()
        {
            this.datepickerView.close();
        },

        onRender: function()
        {
            this.model.off("change", this.render);
            this.datepickerView.setElement(this.$(".datepickerContainer")).render();
        },

        applyDates: function()
        {
            this.model.save();
            this.trigger("change:dashboardDates");
        }
    };

    return TP.ItemView.extend(DashboardHeaderView);
});