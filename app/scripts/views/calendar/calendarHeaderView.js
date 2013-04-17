define(
[
    "TP",
    "views/applicationHeader/coachAndAffiliateCustomizations",
    "hbs!templates/views/calendar/calendarHeader"
],
function(TP, coachAndAffiliateCustomizations, calendarHeaderTemplate)
{
    var calendarHeaderViewBase = {

        className: "calendarHeaderView",

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
            "click button.refreshButton": "onRefreshButtonClicked"
        },

        initialize: function()
        {
            if (!this.model)
                throw "Cannot have a calendarHeaderView without a model";

            this.initializeCoachAndAffiliateCustomizations();
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