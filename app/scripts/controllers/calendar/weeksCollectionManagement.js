define(
[
    "models/calendar/calendarCollection"
],
function(CalendarCollection

    )
{

    var calendarControllerWeeksCollectionManagement = {

        weeksCollectionInitialize: function ()
        {
            this.weeksCollection = new CalendarCollection(null,
            {
                summaryViewEnabled: this.summaryViewEnabled,
                startDate: moment(this.startDate),
                endDate: moment(this.endDate)
            });
        },

        appendWeekToCalendar: function ()
        {
            var startDate = moment(this.endDate).add("days", 1);
            var endDate = moment(startDate).add("days", 6);
            this.endDate = moment(endDate);

            this.weeksCollection.appendWeek(startDate);
            this.weeksCollection.requestWorkouts(startDate, endDate);
        },

        prependWeekToCalendar: function ()
        {
            var endDate = moment(this.startDate).subtract("days", 1);
            var startDate = moment(endDate).subtract("days", 6);
            this.startDate = moment(startDate);

            this.weeksCollection.prependWeek(startDate);
            this.weeksCollection.requestWorkouts(startDate, endDate);
        },

        watchClipboard: function ()
        {
            this.weeksCollection.on("paste:enable", this.onPasteEnabled, this);
            this.weeksCollection.on("paste:disable", this.onPasteDisabled, this);
            this.onPasteDisabled();
        }


    };

    return calendarControllerWeeksCollectionManagement;
});