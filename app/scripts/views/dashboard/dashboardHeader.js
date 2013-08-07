define(
[
    "jqueryui/datepicker",
    "jqueryui/spinner",
    "jquerySelectBox",
    "TP",
    "./dashboardDatePicker",
    "hbs!templates/views/dashboard/dashboardHeader"
],
function (datepicker, spinner, jquerySelectBox, TP, DashboardDatePicker, dashboardHeaderTemplate)
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
            this.settingsKey = "settings.dashboard.globalDateRange";
            this.datepickerView = new DashboardDatePicker({ model: this.model, settingsKey: this.settingsKey, includeGlobalOption: false });
            this.model.on("change:" + this.settingsKey + ".*", this.render, this);
        },

        onClose: function()
        {
            this.datepickerView.close()
        },

        onRender: function()
        {
            this.model.off("change", this.render);
            this.datepickerView.setElement(this.$(".datepickerContainer")).render();
        },

        applyDates: function()
        {
            this.model.save();
        }
    };

    return TP.ItemView.extend(DashboardHeaderView);
});