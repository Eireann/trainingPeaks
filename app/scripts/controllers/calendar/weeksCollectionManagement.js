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
        }
    };

    return calendarControllerWeeksCollectionManagement;
});
