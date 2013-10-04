define(
[
    "jqueryui/datepicker",
    "jqueryui/spinner",
    "jquerySelectBox",
    "underscore",
    "TP",
    "framework/notYetImplemented",
    "./dashboardDatePicker",
    "./chartUtils",
    "./dashboardHeaderDatePicker",
    "hbs!templates/views/dashboard/dashboardHeader"
],
function (datepicker, spinner, jquerySelectBox, _, TP, notYetImplemented, DashboardDatePicker, chartUtils, dashboardHeaderDatePicker, dashboardHeaderTemplate)
{
    var DashboardHeaderView = TP.ItemView.extend(
    {

        className: "frameworkHeaderView",

        template:
        {
            type: "handlebars",
            template: dashboardHeaderTemplate
        },

        events:
        {
            "click .refreshButton": "refresh",
            "click .calendarMonthLabel": "headerDatePicker",
            "click .settingsButton": notYetImplemented
        },

        modelEvents: {},

        initialize: function (options)
        {
            this.settingsKey = "dateOptions";
            this.on("user:loaded", this.setDefaultDateSettings, this);
            this.listenTo(this.model, "applyDates", _.bind(this.applyDates, this));
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

            this.listenTo(theMarsApp.user, "change:dateFormat", _.bind(this.render, this));
            this.render();
        },

        onClose: function()
        {
            if(this.dashboardHeaderDatePicker)
            {
                this.dashboardHeaderDatePicker.close();
            }
        },

        applyDates: function()
        {
            this.model.save();
            this.render();
            this.trigger("change:dashboardDates");
        },

        refresh: function()
        {
            this.trigger("refresh");
        },

        headerDatePicker: function (e)
        {
            if (e && e.button && e.button === 2)
            {
                return;
            }

            e.preventDefault();

            this.$(".frameworkTitle").addClass("titleActive");
            var offset = $(e.currentTarget).offset();
            var windowWidth = $(window).width();

            var direction = (windowWidth - offset.left) > 450 ? "right" : "left";
            var icon = this.$(".headerMonth");

            this.dashboardHeaderDatePicker = new dashboardHeaderDatePicker({model: this.model});

            this.dashboardHeaderDatePicker.setTomahawkDirection(direction);

            this.dashboardHeaderDatePicker.render();
            if (direction === "left")
            {
                this.dashboardHeaderDatePicker.right(offset.left - 15);
            } else
            {
                this.dashboardHeaderDatePicker.left(offset.left + $(e.currentTarget).width() + 70);
            }

            this.dashboardHeaderDatePicker.alignArrowTo(offset.top + ($(e.currentTarget).height() / 2));

            this.dashboardHeaderDatePicker.on("close", this._onChartSettingsClose, this);
        },

        serializeData: function ()
        {
            var data = DashboardHeaderView.__super__.serializeData();
            var dateSettings = chartUtils.buildChartParameters(this.model.get(this.settingsKey));
            _.extend(data, dateSettings);
            return data;
        }
    });

    return DashboardHeaderView;
});
