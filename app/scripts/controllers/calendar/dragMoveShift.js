define(
["views/calendar/library/applyTrainingPlanToCalendarConfirmationView"],
function (ApplyTrainingPlanToCalendarConfirmationView)
{
    var calendarControllerDragMoveShift =
    {
        bindToDragMoveAndShiftEvents: function(calendarView)
        {
            calendarView.on("workoutsShifted", this.onShiftItems, this);
        },

        onShiftItems: function(shiftCommand)
        {
            this.clearCacheAndRefresh();
        }
    };

    return calendarControllerDragMoveShift;
});
