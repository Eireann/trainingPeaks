define(
[
    "models/calendar/calendarCollection"
],
function(CalendarCollection)
{
    var calendarControllerWeeksCollectionManagement =
    {
        weeksCollectionInitialize: function ()
        {
            this.weeksCollection = new CalendarCollection(null,
            {
                summaryViewEnabled: this.summaryViewEnabled,
                startDate: moment(this.startDate),
                endDate: moment(this.endDate),
                startOfWeekDayIndex: this.startOfWeekDayIndex,
                dataManager: this._dataManager
            });
        },

        watchClipboard: function ()
        {
            this.weeksCollection.on("paste:enable", this.onPasteEnabled, this);
            this.weeksCollection.on("paste:disable", this.onPasteDisabled, this);
            this.onPasteDisabled();
        },

        getWorkout: function(workoutId)
        {
            return this.weeksCollection.getWorkout(workoutId);
        },

        addWorkout: function(workout)
        {
            this.weeksCollection.addWorkout(workout);
        }
    };

    return calendarControllerWeeksCollectionManagement;
});
