define(
[
    "moment",
    "TP",
    "models/calendar/calendarDay",
    "shared/models/selectedActivitiesCollection"
],
function(moment, TP, CalendarDayModel, SelectedActivitiesCollection)
{
    var CalendarWeekCollection = TP.Collection.extend(
    {
        
        deleteWeekItems: function()
        {
            var selectedActivitiesCollection = new SelectedActivitiesCollection();

            this.each(function(item)
            {
                if (item instanceof CalendarDayModel)
                {
                    selectedActivitiesCollection.add(item.getItems());
                }
            });

            selectedActivitiesCollection.deleteSelectedItems();
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
            dateToPasteTo = moment(dateToPasteTo);
            this.each(function(day)
            {
                if (typeof day.onPaste === "function")
                {
                    pastedDays.push(day.onPaste(moment(dateToPasteTo)));
                }
                dateToPasteTo.add("days", 1);
            });
            return pastedDays;
        },

        select: function()
        {
            this.each(function(model)
            {
                model.trigger("day:select");
            });
        },

        unselect: function()
        {
            this.each(function(model)
            {
                model.trigger("day:unselect");
            });
        },

        getStartDate: function()
        {
            for (var i = 0; i < this.length; i++)
            {
                if (this.models[i] instanceof CalendarDayModel)
                    return this.models[i].id;
            }
            return null;
        },

        getEndDate: function()
        {
            for (var i = this.length - 1; i >= 0; i--)
            {
                if (this.models[i] instanceof CalendarDayModel)
                    return this.models[i].id;
            }
            return null;
        }

    });

    return CalendarWeekCollection;
});
