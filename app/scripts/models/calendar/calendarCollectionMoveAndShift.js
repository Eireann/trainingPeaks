define(
[

],
function(

    )
{
    var calendarCollectionMoveShift = {

        initializeMoveAndShift: function()
        {
            this.daysCollection.on("workout:added", this.addItem, this);
            this.workoutsCollection.on("workout:move", this.onWorkoutDateChange, this);
        },

        subscribeToWeekMoveAndShift: function(weekCollection)
        {
            weekCollection.on("week:shiftwizard", this.onShiftWizardOpen, this);
        },

        onWorkoutDateChange: function(workoutModel, destinationDate)
        {
            this.moveItem(workoutModel, destinationDate);
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
            this.moveItem(item, options.destinationCalendarDayModel.id);
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
                this.moveItem(item, options.destinationCalendarDayModel.id);
            }

            options.destinationCalendarDayModel.trigger("day:click", options.destinationCalendarDayModel, $.Event());
        },

        moveItem: function(item, destinationDay)
        {

            // if it has a getCalendarDay and moveToDay then we can move it
            if (item && _.isFunction(item.getCalendarDay) && _.isFunction(item.moveToDay))
            {
                var oldCalendarDay = item.getCalendarDay();
                var newCalendarDay = destinationDay;

                if (oldCalendarDay !== newCalendarDay)
                {

                    var sourceCalendarDayModel = this.getDayModel(oldCalendarDay);
                    var deferredResult;

                    // in a date range we already have?
                    try {
                        var destinationCalendarDayModel = this.getDayModel(newCalendarDay);
                        deferredResult = item.moveToDay(newCalendarDay, destinationCalendarDayModel);
                        this.trigger("item:move", item, destinationDay, deferredResult);
                    } catch (e)
                    {
                        // else add it to a new date range so our quick view still works
                        deferredResult = item.moveToDay(newCalendarDay);

                        // let other stuff happen on the deferred result ...
                        this.trigger("item:move", item, destinationDay, deferredResult);

                        // then, add this same workout model instance back to the appropriate calendar day,
                        // replacing a different instance of the same workout, and keeping our currently open quick view intact ...
                        var self = this;
                        var callback = function()
                        {
                            self.addItem(item);
                        };
                        deferredResult.done(callback);
                    }

                }
            }

        },

        onShiftWizardOpen: function()
        {
            this.trigger("shiftwizard:open");
        }
    };

    return calendarCollectionMoveShift;
});