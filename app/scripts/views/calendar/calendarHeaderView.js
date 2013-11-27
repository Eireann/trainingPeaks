define(
[
    "underscore",
    "setImmediate",
    "TP",
    "moment",
    "jqueryui/datepicker",
    "views/applicationHeader/coachAndAffiliateCustomizations",
    "shared/utilities/calendarUtility",
    "hbs!templates/views/calendar/calendarHeader"
],
function(_, setImmediate, TP, moment, datepicker, coachAndAffiliateCustomizations, CalendarUtility, calendarHeaderTemplate)
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
            "change .datepicker": "onDateSelect",
            "change #athleteCalendarSelect": "onAthleteSelectBoxChange"

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

            this.on("render", this.watchForAthletesChange, this);
            this.on("render", this.updateCoachAthleteList, this);
        },

        updateDatepicker: function()
        {
            var date = moment(this.model.get("date")).toDate();
            this.$(".datepicker").datepicker("setDate", date);
        },

        watchForAthletesChange: function ()
        {
            // in case the athletes haven't loaded yet, refresh
            theMarsApp.user.on("change:athletes", this.render, this);
            this.on("close", function()
            {
                theMarsApp.user.off("change:athletes", this.render, this);
            }, this);
        }, 

        updateCoachAthleteList: function()
        {

            if (this.isCoachWithAthletes())
            {
                this.customizeAthleteSelectBox();
                var currentUserId = theMarsApp.user.getCurrentAthleteId();
                this.$("#athleteCalendarSelect").val(currentUserId);
            }
            else
            {
                this.$("#athleteCalendarSelect").remove();
            }
        },

        isCoachWithAthletes: function()
        {
            return !theMarsApp.user.getAccountSettings().get("isAthlete") && theMarsApp.user.has("athletes") && theMarsApp.user.get("athletes").length > 0;
        },

        customizeAthleteSelectBox: function()
        {
            var self = this;
            setImmediate(function ()
            {
                self.$("#athleteCalendarSelect").selectBoxIt({
                    dynamicPositioning: false
                });

                self.$("#athleteCalendarSelectSelectBoxItContainer").css('display', "block");
            });
        },

        onAthleteSelectBoxChange: function ()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "athleteChanged", "eventLabel": "" });

            var athleteId = Number(this.$("#athleteCalendarSelect").val());

            var athleteUrl = "calendar/athletes/" + athleteId;
            theMarsApp.router.navigate(athleteUrl, true);
        },

        serializeData: function ()
        {
            var headerData = this.model.toJSON();
            headerData.athletes = this._getFilteredAthletesForCoach();
            return headerData;
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

        _getFilteredAthletesForCoach: function()
        {
            var athletes = theMarsApp.user.get("athletes");
            return _.filter(athletes, function(athlete)
            {
                return theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.PlanForAthlete, { athlete: athlete });
            });
        }
    };

    _.extend(calendarHeaderViewBase, coachAndAffiliateCustomizations);
    return TP.ItemView.extend(calendarHeaderViewBase);

});
