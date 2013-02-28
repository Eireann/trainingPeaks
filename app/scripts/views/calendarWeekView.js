define(
[
    "moment",
    "TP",
    "views/calendarDayView",
    "views/weekSummaryView"
],
function (moment, TP, CalendarDayView, WeekSummaryView)
{
    return TP.CollectionView.extend(
    {
        tagName: "div",
        className: "week",
        getItemView: function(item)
        {
            if (item.isSummary)
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
        },

        onRender: function()
        {
            this.setThisWeekCss();    
        },

        setThisWeekCss: function ()
        {
            // so we can style today or scroll to it
            if (moment(this.model.id).day(1).diff(moment(), "weeks") === 0)
            {
                this.$el.addClass("thisWeek");
            }
        }

    });
});