﻿define(
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

        // override some of the default waiting functionality, because of the way css:before behaves,
        // we want the pseudo element to be containd inside the week div instead of in it's parent
        initialize: function()
        {
            if (!this.model)
                throw "CalendarWeekView requires a model";

            if (!this.collection)
                throw "CalendarWeekView requires a collection";

            this.waiting = $('<div class="waiting"> </div>');
        },

        onWaitStart: function()
        {
            this.trigger("waitStart");
            this.$el.css("position", "relative");
            this.$el.append(this.waiting);
        },

        onWaitStop: function()
        {
            this.trigger("waitStop");
            this.$el.find('.waiting').remove('.waiting');
        }

    });
});