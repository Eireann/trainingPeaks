define(
[
],
function ()
{
    var calendarControllerDragMoveShift =
    {
        bindToDragMoveAndShiftEvents: function(calendarView)
        {
            calendarView.on("itemDropped", this.onDropItem, this);
            calendarView.on("workoutsShifted", this.onShiftItems, this);
            calendarView.on("itemMoved", this.onItemMoved, this);
        },

        onDropItem: function(options)
        {
            if (options.DropEvent === "itemMoved")
            {
                this.weeksCollection.onItemMoved(options);        
            }
            else if (options.DropEvent === "dayMoved")
            {
                this.weeksCollection.onDayMoved(options);
            }
            else if (options.DropEvent === "addExerciseFromLibrary")
            {
                var destinationDate = options.destinationCalendarDayModel.id;

                // create a model by copying library attributes
                var workout = this.createNewWorkoutFromExerciseLibraryItem(options.LibraryId, options.ItemId, destinationDate);

                // add it to the calendar
                this.weeksCollection.addWorkout(workout);
                this.views.calendar.scrollToDateIfNotFullyVisible(destinationDate);
                workout.trigger("select", workout);
            }

        },

        onItemMoved: function(item, movedToDate, deferredResult)
        {
            var self = this;
            var callback = function()
            {
                self.views.calendar.scrollToDateIfNotFullyVisible(movedToDate);
            };
            deferredResult.done(callback);
        },

        onShiftItems: function(shiftCommand)
        {
            this.clearCacheAndRefresh();
        }
    };

    return calendarControllerDragMoveShift;
});
