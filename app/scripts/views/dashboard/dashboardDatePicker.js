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

            this.settingsKey = options.settingsKey + ".dateOptions";

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
            "change select.dateOptions": "onDateOptionsChanged",
            "change input.startDate": "onDateOptionsChanged",
            "change input.endDate": "onDateOptionsChanged"
        },

        onRender: function()
        {
            this.model.off("change", this.render);

            var self = this;
            setImmediate(function()
            {
                var zIndex = self.$el.css("z-index");
                if(self.$el.closest(".dashboardChartSettings").length)
                {
                    zIndex = self.$el.closest(".dashboardChartSettings").css("z-index");
                }
                self.$(".datepicker").css("position", "relative").css("z-index", zIndex);
                self.$(".datepicker").datepicker({ dateFormat: "yy-mm-dd", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex });
                self.$("select.dateOptions").selectBoxIt({dynamicPositioning: true});
            });
        },

        serializeData: function()
        {
            var dateSettings = this.model.get(this.settingsKey);
            var selectedOptionId = Number(dateSettings.quickDateSelectOption);
            dateSettings = chartUtils.buildChartParameters(dateSettings);
            dateSettings.dateOptionList = [];

            _.each(chartUtils.chartDateOptions, function(option)
            {
                if(option.id !== 1 || this.includeGlobalOption)
                {
                    dateSettings.dateOptionList.push({
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
            var optionId = Number(this.$("select.dateOptions").val());

            var dateOptions = {
                quickDateSelectOption: optionId,
                startDate: this.$("input.startDate").val(),
                endDate: this.$("input.endDate").val()
            };

            dateOptions = chartUtils.buildChartParameters(dateOptions);

            this.model.set(this.settingsKey + ".startDate", dateOptions.customStartDate ? moment(dateOptions.startDate).format("YYYY-MM-DD") + "T00:00:00Z" : null, { silent: true });
            this.model.set(this.settingsKey + ".endDate", dateOptions.customEndDate ? moment(dateOptions.endDate).format("YYYY-MM-DD") + "T00:00:00Z" : null, { silent: true });
            this.model.set(this.settingsKey + ".quickDateSelectOption", optionId);

            this.updateViewFields(dateOptions);
        },

        updateViewFields: function(dateOptions)
        {

            if(dateOptions.customStartDate)
            {
                this.$(".dateRanges").addClass("customStartDate");
            }
            else
            {
                this.$(".dateRanges").removeClass("customStartDate");
            }

            if(dateOptions.customEndDate)
            {
                this.$(".dateRanges").addClass("customEndDate");
            }
            else
            {
                this.$(".dateRanges").removeClass("customEndDate");
            }

            var startDate = moment(dateOptions.startDate).format("YYYY-MM-DD");
            var endDate = moment(dateOptions.endDate).format("YYYY-MM-DD");
            this.$("input.startDate").val(startDate);
            this.$("div.startDate").text(startDate);
            this.$("input.endDate").val(endDate);
            this.$("div.endDate").text(endDate);

            this.$("input.startDate").datepicker("option", "maxDate", endDate);
            this.$("input.endDate").datepicker("option", "minDate", startDate);

        }

    });
});