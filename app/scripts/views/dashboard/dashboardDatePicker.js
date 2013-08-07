define(
[
    "jqueryui/datepicker",
    "jquerySelectBox",
    "setImmediate",
    "underscore",
    "TP",
    "views/dashboard/chartUtils",
    "hbs!templates/views/dashboard/dashboardDatePicker"
],
function(
    datepicker,
    jquerySelectBox,
    setImmediate,
    _,
    TP,
    chartUtils,
    datepickerTemplate
    )
{
    return TP.ItemView.extend(
    {
        tagName: "div",
        className: "dashboardDatePicker",
        includeGlobalOption: true,

        template:
        {
            type: "handlebars",
            template: datepickerTemplate
        },

        initialize: function(options)
        {
            if(!options.hasOwnProperty("settingsKey"))
            {
                throw "Dashboard Date Picker requires a settings key";
            }

            this.settingsKey = options.settingsKey;

            if(options.hasOwnProperty("includeGlobalOption"))
            {
                this.includeGlobalOption = options.includeGlobalOption;
            }
            
            this.setDefaultDateSettings();
        },

        setDefaultDateSettings: function()
        {
            if (!this.model.has(this.settingsKey))
            {
                this.model.set(this.settingsKey, { startDate: null, endDate: null, quickDateSelectOption: null }, { silent: true });
            }
        },

        events:
        {
            "change #dateOptions": "onDateOptionsChanged",
            "change #startDate": "onDateOptionsChanged",
            "change #endDate": "onDateOptionsChanged"
        },

        onRender: function()
        {
            this.model.off("change", this.render);

            var self = this;
            setImmediate(function()
            {
                self.$(".datepicker").css("position", "relative").css("z-index", self.$el.css("z-index"));
                self.$(".datepicker").datepicker({ dateFormat: "yy-mm-dd", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex });
                self.$("#dateOptions").selectBoxIt({dynamicPositioning: false});
            });

            if(this.focusedInputId)
            {
                setImmediate(function()
                {
                    self.$("#" + self.focusedInputId).focus();
                    self.focusedInputId = null;
                });
            }

        },

        serializeData: function()
        {
            var dateSettings = this.model.get(this.settingsKey);
            var selectedOptionId = Number(dateSettings.quickDateSelectOption);
            dateSettings = chartUtils.buildChartParameters(dateSettings);
            dateSettings.dateOptions = [];

            _.each(chartUtils.chartDateOptions, function(option)
            {
                if(option.id !== 1 || this.includeGlobalOption)
                {
                    dateSettings.dateOptions.push({
                        id: option.id,
                        label: option.label,
                        selected: option.id === selectedOptionId
                    });
                }
            }, this);

            return dateSettings;
        },

        onDateOptionsChanged: function(e)
        {
            this.focusedInputId = e.target.id;
            var optionId = this.$("#dateOptions").val();

            var dateOptions = {
                quickDateSelectOption: optionId,
                startDate: this.$("#startDate").val(),
                endDate: this.$("#endDate").val()
            };

            dateOptions = chartUtils.buildChartParameters(dateOptions);

            this.model.set(this.settingsKey + ".startDate", dateOptions.customStartDate ? moment(dateOptions.startDate).format("YYYY-MM-DD") + "T00:00:00Z" : null, { silent: true });
            this.model.set(this.settingsKey + ".endDate", dateOptions.customEndDate ? moment(dateOptions.endDate).format("YYYY-MM-DD") + "T00:00:00Z" : null, { silent: true });
            this.model.set(this.settingsKey + ".quickDateSelectOption", optionId);

        }

    });
});