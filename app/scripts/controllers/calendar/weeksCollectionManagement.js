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

        // QL: Deprecated
        appendWeekToCalendar: function ()
        {
            console.warn("appendWeekToCalendar is deprecated and no longer functional");
            return;
        },

        // QL: Deprecated
        prependWeekToCalendar: function()
        {
            console.warn("prependWeekToCalendar is deprecated and no longer functional");
            return;
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
