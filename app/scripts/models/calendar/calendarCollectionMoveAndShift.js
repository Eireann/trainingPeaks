﻿define(
[

],
function(

    )
{
    var calendarCollectionMoveShift = {

        initializeMoveAndShift: function()
        {
            this.daysCollection.on("workout:added", this.addItem, this);
        },

        subscribeToWeekMoveAndShift: function(weekCollection)
        {
            weekCollection.on("week:shiftwizard", this.onShiftWizardOpen, this);
        },

        onItemMoved: function(options)
        {
            if (!options.hasOwnProperty('ItemId') || !options.ItemId ||
                !options.hasOwnProperty('destinationCalendarDayModel') || !options.destinationCalendarDayModel)
            {
                theMarsApp.logger.debug("CalendarCollection.onItemMoved: missing ItemId or destinationCalendarDayModel attribute?");
                return;
            }

            // get the item
            var item = this.workoutsCollection.get(options.ItemId);
            item.moveToDay(options.destinationCalendarDayModel.id);
        },

        onDayMoved: function(options)
        {
            if (!options.hasOwnProperty('ItemId') || !options.ItemId ||
                !options.hasOwnProperty('destinationCalendarDayModel') || !options.destinationCalendarDayModel)
            {
                theMarsApp.logger.debug("CalendarCollection.onItemMoved: missing ItemId or destinationCalendarDayModel attribute?");
                return;
            }

            // get the item
            var sourceDayModel = this.getDayModel(options.ItemId);
            var item = null;

            // first model is day label ...
            while (sourceDayModel.itemsCollection.length > 1)
            {
                item = sourceDayModel.itemsCollection.pop();
                item.moveToDay(options.destinationCalendarDayModel.id);
            }

            options.destinationCalendarDayModel.trigger("day:click", options.destinationCalendarDayModel, $.Event());
        },

        onShiftWizardOpen: function()
        {
            this.trigger("shiftwizard:open");
        }
    };

    return calendarCollectionMoveShift;
});