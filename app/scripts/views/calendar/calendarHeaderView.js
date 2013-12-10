define(
[
    "underscore",
    "setImmediate",
    "backbone",
    "TP",
    "moment",
    "jqueryui/datepicker",
    "views/applicationHeader/athletePickerView",
    "views/applicationHeader/coachAndAffiliateCustomizations",
    "shared/utilities/calendarUtility",
    "hbs!templates/views/calendar/calendarHeader"
],
function(
         _,
         setImmediate,
         Backbone,
         TP,
         moment,
         datepicker,
         AthletePickerView,
         coachAndAffiliateCustomizations,
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
            "click #goToTodayButton": "onGoToTodayButtonClicked",
            "click #goToNextWeekButton": "onGoToNextWeekButtonClicked",
            "click #goToLastWeekButton": "onGoToLastWeekButtonClicked",
            "click button.refreshButton": "onRefreshButtonClicked",
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

        initialize: function()
        {
            if (!this.model)
                throw "Cannot have a calendarHeaderView without a model";

            this.initializeCoachAndAffiliateCustomizations();
            this.initializeStickit();
            this.children = new Backbone.ChildViewContainer(); 
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

    _.extend(calendarHeaderViewBase, coachAndAffiliateCustomizations);
    return TP.ItemView.extend(calendarHeaderViewBase);

});
