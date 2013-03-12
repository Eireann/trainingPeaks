define(
[
    "underscore",
    "moment",
    "TP"
],
function(_, moment, TP)
{

    var CalendarDay = TP.Model.extend(
    {

        idAttribute: 'date',
        dateFormat: "YYYY-MM-DD",

        initialize: function()
        {
            this.configureDate();
            this.configureCollection();
        },

        configureDate: function()
        {
            // we need a date
            var date = this.get("date");
            if(!date)
                throw "CalendarDay requires a date";

            // use a formatted string for date attribute and for calendar id
            this.set("date", moment(date).format(this.dateFormat), { silent: true });
        },

        configureCollection: function()
        {
            // empty collection to store our collection
            this.itemsCollection = new TP.Collection();
        },

        // gets called via onBeforeRender of calendarDayView - only add a label if we need it for render,
        // but not for copy/paste etc
        configureDayLabel: function()
        {
            if (!this.hasLabel)
            {
                // add a model to hold our label
                var dayLabel = new TP.Model({ date: this.get("date") });
                dayLabel.isDateLabel = true;
                this.itemsCollection.unshift(dayLabel);
                this.hasLabel = true;
            }
        },

        add: function(item, noParentReference)
        {
            this.itemsCollection.add(item);
        },

        remove: function(item)
        {
            this.itemsCollection.remove(item);
        },

        copyToClipboard: function()
        {
            var calendarDay = new CalendarDay({ date: this.get("date") });
            this.itemsCollection.each(function(item)
            {
                if (typeof item.copyToClipboard === "function")
                    calendarDay.add(item.copyToClipboard());
            });
            return calendarDay;
        },
        
        cutToClipboard: function()
        {
            var calendarDay = new CalendarDay({ date: this.get("date") });
            this.itemsCollection.each(function (item)
            {
                if (typeof item.cutToClipboard === "function")
                    calendarDay.add(item.cutToClipboard());
            });
            return calendarDay;
        },
        
        onPaste: function(dateToPasteTo)
        {
            var pastedItems = [];
            this.itemsCollection.each(function(item)
            {
                if (typeof item.onPaste === "function")
                {
                    pastedItems.push(item.onPaste(dateToPasteTo));
                }
            });
            return pastedItems;
        },

        length: function()
        {
            return this.itemsCollection.length;
        }

    }, { hasLabel: false });

    return CalendarDay;
});