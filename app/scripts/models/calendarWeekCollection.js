define(
[
    "TP"
],
function(TP)
{
    var CalendarWeekCollection = TP.Collection.extend(
    {
        
        deleteWeekItems: function()
        {
            this.each(function(item)
            {
                if (item.deleteDayItems)
                    item.deleteDayItems();
            });
        },

        copyToClipboard: function()
        {
            var calendarWeek = new CalendarWeekCollection();
            this.each(function(day)
            {
                if (typeof day.copyToClipboard === "function")
                    calendarWeek.add(day.copyToClipboard());
            });
            return calendarWeek;
        },
        
        cutToClipboard: function()
        {
            var calendarWeek = new CalendarWeekCollection();
            this.each(function(day)
            {
                if (typeof day.cutToClipboard === "function")
                    calendarWeek.add(day.cutToClipboard());
            });
            return calendarWeek;
        },
        
        onPaste: function(dateToPasteTo)
        {
            var pastedDays = [];
            this.each(function(day)
            {
                if (typeof day.onPaste === "function")
                {
                    pastedDays.push(day.onPaste(dateToPasteTo));
                }
            });
            return pastedDays;
        }
    });

    return CalendarWeekCollection;
});