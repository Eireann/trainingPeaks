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
            this._getDocument().toggleFullScreen(!this._isFullScreen());
        },

        _setupFullScreenEvents: function()
        {
            var onFullScreenChange = _.bind(_.debounce(this._onFullScreenChange, 100), this);
            this._getDocument().on("fullscreenchange.calendarHeaderView", onFullScreenChange);
            this._getWindow().on("resize.calendarHeaderView", onFullScreenChange);
        },

        _cleanupFullScreenEvents: function()
        {
            this._getDocument().off("fullscreenchange.calendarHeaderView");
            this._getWindow().off("resize.calendarHeaderView");
        },

        _onFullScreenChange: function()
        {
            setImmediate(_.bind(this._updateFullScreenState, this));
        },

        _isFullScreen: function()
        {
            return !!this._getDocument().fullScreen() || (this._getWindow().innerHeight() === this._getScreen().height);
        },

        _updateFullScreenState: function()
        {
            var isFullScreen = this._isFullScreen();
            theMarsApp.getBodyElement().toggleClass("fullScreen", isFullScreen);
            setImmediate(_.bind(this._triggerScrollRefresh, this));
            this._logFullScreen(isFullScreen);
        },

        _logFullScreen: function(isFullScreen)
        {
            if(isFullScreen)
            {
                //this.fullScreenStartTime = moment().unix();
                TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "enterFullScreen", "eventLabel": "" });
            }
            else if(this.fullScreenStartTime)
            {
                //var secondsInFullScreen = moment().unix() - this.fullScreenStartTime;
                //delete this.fullScreenStartTime;
                TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "exitFullScreen", "eventLabel": "" });
            }
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
        },

        _getScreen: function()
        {
            return screen;
        },

        _getDocument: function()
        {
            return $(document);
        },

        _getWindow: function()
        {
            return $(window);
        }
    };

    return TP.ItemView.extend(calendarHeaderViewBase);

});
