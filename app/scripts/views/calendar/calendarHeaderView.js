define(
[
    "TP",
    "moment",
    "views/applicationHeader/coachAndAffiliateCustomizations",
    "hbs!templates/views/calendar/calendarHeader"
],
function(TP, moment, coachAndAffiliateCustomizations, calendarHeaderTemplate)
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
            if (value)
            {
                return moment(value).format("MMMM");
            }
            else
            {
                return "";
            }
        },

        formatYear: function(value)
        {
            if (value)
            {
                return moment(value).format("YYYY");
            }
            else
            {
                return "";
            }
        },

        modelEvents: {},

        initialize: function()
        {
            if (!this.model)
                throw "Cannot have a calendarHeaderView without a model";

            this.initializeCoachAndAffiliateCustomizations();
            this.initializeStickit();

            this.on("render", this.watchForAthletesChange, this);
            this.on("render", this.updateCoachAthleteList, this);
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
        },

        isCoachWithAthletes: function()
        {
            return !theMarsApp.user.get("settings.account.isAthlete") && theMarsApp.user.has("athletes") && theMarsApp.user.get("athletes").length > 0;
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
            headerData.athletes = theMarsApp.user.get("athletes");

            return headerData;
        },

        onGoToTodayButtonClicked: function ()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "todayClicked", "eventLabel": "" });
            this.trigger("request:today");
        },
        
        onGoToNextWeekButtonClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "nextWeekClicked", "eventLabel": "" });
            this.trigger("request:nextweek", this.model);
        },
        
        onGoToLastWeekButtonClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "lastWeekClicked", "eventLabel": "" });
            this.trigger("request:lastweek", this.model);
        },
        
        onRefreshButtonClicked: function()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "refreshClicked", "eventLabel": "" });
            this.trigger("request:refresh", this.model.get("date"));
        }
    };

    _.extend(calendarHeaderViewBase, coachAndAffiliateCustomizations);
    return TP.ItemView.extend(calendarHeaderViewBase);

});