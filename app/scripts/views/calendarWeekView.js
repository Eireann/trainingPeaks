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
        }
    });
});