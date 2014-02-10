define(
[
    "underscore",
    "jquery",
    "setImmediate",
    "backbone",
    "TP",
    "moment",
    "jqueryui/datepicker",
    "views/applicationHeader/athletePickerView",
    "shared/utilities/calendarUtility",
    "hbs!templates/views/calendar/calendarHeader"
],
function(
         _,
         $,
         setImmediate,
         Backbone,
         TP,
         moment,
         datepicker,
         AthletePickerView,
         CalendarUtility,
         calendarHeaderTemplate
         )
{

    var calendarHeaderViewBase = {

        className: "calendarHeaderView frameworkHeaderView",

        template:
        {
            type: "handlebars",
            template: calendarHeaderTemplate
        },

        events:
        {
            "click .goToTodayButton": "onGoToTodayButtonClicked",
            "click .goToNextWeekButton": "onGoToNextWeekButtonClicked",
            "click .goToLastWeekButton": "onGoToLastWeekButtonClicked",
            "click button.refreshButton": "onRefreshButtonClicked",
            "click button.fullScreen": "onFullScreenClicked",
            "change .datepicker": "onDateSelect"
        },

        initializeStickit: function()
        {
            this.on("render", this.stickitOnRender, this);
        },

        stickitOnRender: function()
        {
            if (this.stickitInitialized)
            {
                this.unstickit();
            }

            this.stickit();
            this.stickitInitialized = true;
        },

        onRender: function()
        {
            this.$(".datepicker").datepicker(
            {
                dateFormat: "yy-mm-dd",
                firstDay: CalendarUtility.startOfWeek,
                changeYear: true,
                changeMonth: true
            });
            this.updateDatepicker();

            this._addView(".athletePickerContainer", new AthletePickerView({ basePath: "calendar" }));
            this.children.call("render");


        },

        bindings:
        {
            ".headerMonth":
            {
                observe: "date",
                onGet: "formatMonth"
            },

            ".headerYear":
            {
                observe: "date",
                onGet: "formatYear"
            }
        },

        formatMonth: function(value)
        {
            return this._getLastDayOfWeek(value).format("MMMM");
        },

        formatYear: function(value)
        {
            return this._getLastDayOfWeek(value).format("YYYY");
        },

        _getLastDayOfWeek: function(value)
        {
            var date = moment(value);
            if(date.day() !== 0)
            {
                date.day(7);
            }
            return date;
        },

        modelEvents: {
            "change:date": "updateDatepicker"
        },

        initialize: function(options)
        {
            if (!this.model)
                throw "Cannot have a calendarHeaderView without a model";

            this.analytics = options.analytics || TP.analytics;
            this.initializeStickit();
            this.children = new Backbone.ChildViewContainer(); 
            this.on("close", _.bind(this.children.call, this.children, "close"));

            if(!options || !options.fullScreenManager)
            {
                throw new Error("Calendar Header View requires a full screen manager");
            }
            this.fullScreenManager = options.fullScreenManager;
            this.listenTo(this.fullScreenManager, "change:fullScreen", _.bind(this._triggerScrollRefresh, this));
        },

        updateDatepicker: function()
        {
            var date = moment(this.model.get("date")).toDate();
            this.$(".datepicker").datepicker("setDate", date);
        },

        onDateSelect: function()
        {
            this.model.setDate(this.$('.datepicker').val());
            this.$('.datepicker').blur(); // So we can open the datepicker again
        },

        onGoToTodayButtonClicked: function ()
        {
            this.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "todayClicked", "eventLabel": "" });
            this.model.setDate(TP.utils.datetime.getTodayDate());
        },
        
        onGoToNextWeekButtonClicked: function()
        {
            this.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "nextWeekClicked", "eventLabel": "" });
            this.model.setDate(moment(this.model.get("date")).add(1, "week"));
        },
        
        onGoToLastWeekButtonClicked: function()
        {
            this.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "lastWeekClicked", "eventLabel": "" });
            this.model.setDate(moment(this.model.get("date")).subtract(1, "week"));
        },
        
        onRefreshButtonClicked: function()
        {
            this.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "refreshClicked", "eventLabel": "" });
            theMarsApp.calendarManager.reset();
            // TODO: Reset libraries too?
        },

        onFullScreenClicked: function()
        {
            this.fullScreenManager.toggleFullScreen();
        },

        _triggerScrollRefresh: function()
        {
            var self = this;
            setImmediate(function()
            {
                self.model.trigger("change:date", self.model, self.model.get("date"), {});
            });
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

    };

    return TP.ItemView.extend(calendarHeaderViewBase);

});
