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
            if (!this.stickitInitialized)
            {
                this.stickit();
                this.stickitInitialized = true;
            }
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
            },
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
        },

        onRender: function ()
        {
            if (!theMarsApp.user.get("settings.account.isAthlete"))
            {
                this.customizeAthleteSelectBox();
                var currentUserId = theMarsApp.user.getCurrentAthleteId();
                this.$("#athleteCalendarSelect").val(currentUserId);
            }
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

        onGoToTodayButtonClicked: function()
        {
            this.trigger("request:today");
        },
        
        onGoToNextWeekButtonClicked: function()
        {
            this.trigger("request:nextweek", this.model);
        },
        
        onGoToLastWeekButtonClicked: function()
        {
            this.trigger("request:lastweek", this.model);
        },
        
        onRefreshButtonClicked: function()
        {
            this.trigger("request:refresh", this.model);
        }
    };

    _.extend(calendarHeaderViewBase, coachAndAffiliateCustomizations);
    return TP.ItemView.extend(calendarHeaderViewBase);

});