define(
[
    "TP",

    "views/calendarDayView",
    "views/weekSummaryView"
],
function (TP, CalendarDayView, WeekSummaryView)
{
    return TP.CollectionView.extend(
    {
        tagName: "div",
        className: "week",
        itemView: CalendarDayView,
        getItemView: function(item)
        {
            if (item.isWeekSummary)
                return WeekSummaryView;
            else
                return CalendarDayView;
        },

        modelEvents: {
            "all": "logEvent"
        },

        logEvent: function(eventName)
        {
            console.log("Received event: " + eventName);
        },

        // override some of the default throbber functionality
        initialize: function()
        {
            this.throbber = $('<div class="waiting"> </div>');
        },

        onWaitStart: function()
        {
            this.trigger("waitStart");
            this.$el.css("position", "relative");
            this.$el.append(this.throbber);
        },

        onWaitStop: function()
        {
            this.trigger("waitStop");
            this.$el.remove('.waiting');
        }

    });
});