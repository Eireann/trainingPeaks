define(
[
    "jqueryui/datepicker",
    "jqueryui/spinner",
    "jquerySelectBox",
    "TP",
    "views/dashboard/chartUtils",
    "hbs!templates/views/dashboard/dashboardHeader"
],
function (datepicker, spinner, jquerySelectBox, TP, chartUtils, dashboardHeaderTemplate)
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
            "change #chartDateOptions": "onDateOptionsChanged",
            "change #startDate": "onDateOptionsChanged",
            "change #endDate": "onDateOptionsChanged",
        },

        onRender: function()
        {
            self = this;
            setImmediate(function ()
            {
                self.$("#chartDateOptions").selectBoxIt({
                    dynamicPositioning: false
                });

                self.$(".datepicker").css("position", "relative").css("z-index", self.$el.css("z-index"));
                self.$(".datepicker").datepicker({ dateFormat: "yy-mm-dd", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex });
            });
        },

        initialize: function (options)
        {

         
            this.settingsKey = "settings.dashboard.defaults";
            if (!this.model.has(this.settingsKey))
            {
                this.model.set(this.settingsKey, { startDate: null, endDate: null, quickDateSelectOption: null });
            }
            this.model.on("change:" + this.settingsKey + ".*", this.render, this);
        },

        serializeData: function()
        {
            var chartSettings = chartUtils.buildChartParameters(this.model.get(this.settingsKey));

            chartSettings.dateOptions = [];
            var selectedOptionId = Number(chartSettings.quickDateSelectOption);
            _.each(chartUtils.chartDateOptions, function (option)
            {
                chartSettings.dateOptions.push({
                    id: option.id,
                    label: option.label,
                    selected: option.id === selectedOptionId
                });
            });

            return chartSettings;
        },

        onDateOptionsChanged: function (e)
        {
            this.hasChangedSettings = true;
            this.focusedInputId = e.target.id;
            var optionId = this.$("#chartDateOptions").val();

            var chartOptions = {
                quickDateSelectOption: optionId,
                startDate: this.$("#startDate").val(),
                endDate: this.$("#endDate").val()
            };

            chartOptions = chartUtils.buildChartParameters(chartOptions);

            this.model.set(this.settingsKey + ".startDate", chartOptions.customStartDate ? moment(chartOptions.startDate).format("YYYY-MM-DD") + "T00:00:00Z" : null, { silent: true });
            this.model.set(this.settingsKey + ".endDate", chartOptions.customEndDate ? moment(chartOptions.endDate).format("YYYY-MM-DD") + "T00:00:00Z" : null, { silent: true });
            this.model.set(this.settingsKey + ".quickDateSelectOption", optionId);
        },
    };

    return TP.ItemView.extend(DashboardHeaderView);
});