define(
[
    "TP",
    "hbs!templates/views/calendarHeader"
],
function(TP, calendarHeaderTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: calendarHeaderTemplate
        },

        events:
        {
            "click #goToTodayButton": "onGoToTodayButtonClicked",
            "click #goToNextWeekButton": "onGoToNextWeekButtonClicked",
            "click #goToLastWeekButton": "onGoToLastWeekButtonClicked"
        },

        initialize: function()
        {
            if (!this.model)
                throw "Cannot have a CalendarHeaderView without a model";
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
        }
    });
});