define(
[
    "underscore",
    "moment",
    "TP"
],
function(
    _,
    moment,
    TP
)
{

    function CalendarUtils()
    {

    }

    _.extend(CalendarUtils,
    {

        startOfWeek: 1,
        idFormat: "YYYY-MM-DD",

        weekMomentForDate: function(date)
        {
            date = moment(date).startOf('day');

            if(date.day() < CalendarUtils.startOfWeek)
            {
                // If startOfWeek is 1 (Monday) then Sunday needs to be part of the previous week
                date.subtract(1, "week");
            }
            date.day(CalendarUtils.startOfWeek);
            return date;
        },

        weekForDate: function(date)
        {
            date = CalendarUtils.weekMomentForDate(date);
            return date.format(CalendarUtils.idFormat);
        },

        weeksForRange: function(start, end)
        {
            start = CalendarUtils.weekMomentForDate(start);
            end = CalendarUtils.weekMomentForDate(end);
            date = moment(start);

            var weeks = [];
            while(date <= end)
            {
                weeks.push(date.format(CalendarUtils.idFormat));
                date.add(1, "week");
            }

            return weeks;
        },

        startMomentOfWeek: function(week)
        {
            return moment(week);
        },

        endMomentOfWeek: function(week)
        {
            return moment(week).add(6, "days");
        }

    });

    return CalendarUtils;

});
