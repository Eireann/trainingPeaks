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
            //var startTime = +new Date();
            this.weeksCollection = new CalendarCollection(null,
            {
                summaryViewEnabled: this.summaryViewEnabled,
                startDate: moment(this.startDate),
                endDate: moment(this.endDate)
            });
            //console.log("Weeks collection init took " + (+new Date() - startTime) + "ms");
        },

        // Deprecated
        appendWeekToCalendar: function ()
        {
            return;
            var startDate = moment(this.endDate).add("days", 1);
            var endDate = moment(startDate).add("days", 6);
            this.endDate = moment(endDate);

            this.weeksCollection.appendWeek(startDate);
            this.weeksCollection.requestWorkouts(startDate, endDate);
        },

        // Deprecated
        prependWeekToCalendar: function()
        {
            return;
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
        },

        getWorkout: function(workoutId)
        {
            return this.weeksCollection.getWorkout(workoutId);
        }


    };

    return calendarControllerWeeksCollectionManagement;
});
