define(
[
    "TP",
    "models/calendarDay"
],
function(TP, CalendarDayModel)
{
    return TP.Collection.extend(
    {
        model: CalendarDayModel
    });
});