define(
[
    "jqueryui/datepicker",
    "setImmediate",
    "underscore",
    "moment",
    "TP",
    "shared/utilities/calendarUtility",
    "views/dashboard/chartUtils",
    "hbs!templates/views/dashboard/dashboardDatePicker"
],
function(
    datepicker,
    setImmediate,
    _,
    moment,
    TP,
    CalendarUtility,
    chartUtils,
    datepickerTemplate
    )
{
    return TP.ItemView.extend(
    {
        // className: "dashboardDatePicker",
        includeGlobalOption: true,

        template:
        {
            type: "handlebars",
            template: datepickerTemplate
        },

        initialize: function(options)
        {
            this.settingsKey = options.key || (options.settingsKey ? options.settingsKey + ".dateOptions" : "dateOptions");

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

            var zIndex = this.$el.css("z-index");
            if(this.$el.closest(".dashboardChartSettings").length)
            {
                zIndex = this.$el.closest(".dashboardChartSettings").css("z-index");
            }
            this.$(".datepicker").css("position", "relative").css("z-index", zIndex);
            this.$(".datepicker").datepicker({ dateFormat: TP.utils.datetime.format.getFormatForDatepicker(), firstDay: CalendarUtility.startOfWeek });
            this.$("input.startDate").datepicker("option", "maxDate", this.$("input.endDate").val());
            this.$("input.endDate").datepicker("option", "minDate", this.$("input.startDate").val());
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

        onDateOptionsChanged: function()
        {
            var optionId = Number(this.$("select.dateOptions").val());

            var dateOptions = {
                quickDateSelectOption: optionId,
                startDate: this.$("input.startDate").datepicker( "getDate" ),
                endDate: this.$("input.endDate").datepicker( "getDate" )
            };

            dateOptions = chartUtils.buildChartParameters(dateOptions);

            this.model.set(this.settingsKey + ".startDate", dateOptions.customStartDate ? moment(dateOptions.startDate).format("YYYY-MM-DD") : null);
            this.model.set(this.settingsKey + ".endDate", dateOptions.customEndDate ? moment(dateOptions.endDate).format("YYYY-MM-DD") : null);
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

            var startDate = TP.utils.datetime.format(dateOptions.startDate);
            var endDate = TP.utils.datetime.format(dateOptions.endDate);
            this.$("input.startDate").val(startDate);
            this.$("div.startDate").text(startDate);
            this.$("input.endDate").val(endDate);
            this.$("div.endDate").text(endDate);

            this.$("input.startDate").datepicker("option", "maxDate", endDate);
            this.$("input.endDate").datepicker("option", "minDate", startDate);

        },

        enable: function()
        {
            this.$("input").attr("disabled", false);
        },

        disable: function()
        {
            this.$("input").attr("disabled", true);
        }

    });
});
