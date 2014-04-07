﻿define(
[
    "jquery",
    "jqueryui/datepicker",
    "jqueryui/spinner",
    "underscore",
    "backbone",
    "TP",
    "./dashboardDatePicker",
    "./chartUtils",
    "./dashboardHeaderDatePicker",
    "views/applicationHeader/athletePickerView",
    "hbs!templates/views/dashboard/dashboardHeader"
],
function (
          $,
          datepicker,
          spinner,
          _,
          Backbone,
          TP,
          DashboardDatePicker,
          chartUtils,
          dashboardHeaderDatePicker,
          AthletePickerView,
          dashboardHeaderTemplate
          )
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
            "click button.fullScreen": "onFullScreenClicked"
        },

        modelEvents: {},

        initialize: function (options)
        {
            this.settingsKey = "dateOptions";
            this.on("user:loaded", this.setDefaultDateSettings, this);
            this.on("user:loaded", this.render, this);
            this.listenTo(this.model, "applyDates", this.applyDates);
            this.setDefaultDateSettings();

            if(!options || !options.fullScreenManager)
            {
                throw new Error("Dashboard Header View requires a full screen manager");
            }
            this.fullScreenManager = options.fullScreenManager;
        },

        onRender: function()
        {
            this.children = new Backbone.ChildViewContainer(); 
            this.on("close", _.bind(this.children.call, this.children, "close"));
            this._addView(".athletePickerContainer", new AthletePickerView({ basePath: "dashboard" }));
            this.children.call("render");
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

            this.listenTo(theMarsApp.user, "change:dateFormat", this.render);
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

            this.listenTo(this.dashboardHeaderDatePicker, "close", this._onChartSettingsClose);
        },

        serializeData: function ()
        {
            var data = DashboardHeaderView.__super__.serializeData();
            var dateSettings = chartUtils.buildChartParameters(this.model.get(this.settingsKey));
            _.extend(data, dateSettings);
            return data;
        },

        onFullScreenClicked: function()
        {
            this.fullScreenManager.toggleFullScreen();
        },

        _addView: function(selector, view)
        {
            if (_.isString(view))
            {
                this.$(selector).html(view);
            } else
            {
                this.$(selector).append(view.$el);
            }
            this.children.add(view);
        }
    });

    return DashboardHeaderView;
});
