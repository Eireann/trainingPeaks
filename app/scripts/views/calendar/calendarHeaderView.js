define(
[
    "underscore",
    "jquery",
    "setImmediate",
    "backbone",
    "TP",
    "moment",
    "jqueryui/datepicker",
    "jqueryFullScreen",
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
         jqueryFullScreen,
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

            this._setupFullScreenEvents();
            this._updateFullScreenState();
        },

        onClose: function()
        {
            this._cleanupFullScreenEvents(); 
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

        initialize: function()
        {
            if (!this.model)
                throw "Cannot have a calendarHeaderView without a model";

            this.initializeStickit();
            this.children = new Backbone.ChildViewContainer(); 
            this.on("close", _.bind(this.children.call, this.children, "close"));
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
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "todayClicked", "eventLabel": "" });
            this.model.setDate(moment());
        },
        
        onGoToNextWeekButtonClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "nextWeekClicked", "eventLabel": "" });
            this.model.setDate(moment(this.model.get("date")).add(1, "week"));
        },
        
        onGoToLastWeekButtonClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "lastWeekClicked", "eventLabel": "" });
            this.model.setDate(moment(this.model.get("date")).subtract(1, "week"));
        },
        
        onRefreshButtonClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "refreshClicked", "eventLabel": "" });
            theMarsApp.calendarManager.reset();
            // TODO: Reset libraries too?
        },

        onFullScreenClicked: function()
        {
            $(document).toggleFullScreen(!this._isFullScreen());
        },

        _setupFullScreenEvents: function()
        {
            var onFullScreenChange = _.bind(this._onFullScreenChange, this);
            $(document).on("fullscreenchange.calendarHeaderView", onFullScreenChange);
            $(window).on("resize.calendarHeaderView", onFullScreenChange);
        },

        _cleanupFullScreenEvents: function()
        {
            $(document).off("fullscreenchange.calendarHeaderView");
            $(window).off("resize.calendarHeaderView");
        },

        _onFullScreenChange: function()
        {
            setImmediate(_.bind(this._updateFullScreenState, this));
        },

        _isFullScreen: function()
        {
            return !!$(document).fullScreen() || (window.innerHeight === screen.height);
        },

        _updateFullScreenState: function()
        {
            var isFullScreen = this._isFullScreen();
            $("body").toggleClass("fullScreen", isFullScreen);
            setImmediate(_.bind(this._triggerScrollRefresh, this));
        },

        _triggerScrollRefresh: function()
        {
            this.model.trigger("change:date", this.model, this.model.get("date"), {});
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
