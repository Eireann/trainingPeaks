define(
    [
    "underscore",
    "moment",
    "TP",
    "layouts/calendarLayout",
    "models/calendarCollection",
    "models/calendarWeekCollection",
    "models/calendarDay",
    "views/calendarView"
    ],
function (_, moment, TP, CalendarLayout, CalendarCollection, CalendarWeekCollection, CalendarDayModel, CalendarView)
{
    return TP.Controller.extend(
    {
        startOfWeekDayIndex: 0,
        summaryViewEnabled: true,

        show: function()
        {
            this.initializeCalendar();
            this.weeksCollection.requestWorkouts(this.startDate, this.endDate);
            this.layout.mainRegion.show(this.views.calendar);
        },

        initialize: function ()
        {
            this.views = {};
            
            this.layout = new CalendarLayout();
            this.layout.on("show", this.show, this);

            this.dateFormat = "YYYY-MM-DD";

            // start on a Sunday
            this.startDate = moment().day(this.startOfWeekDayIndex).subtract("weeks", 4);

            // end on a Saturday
            this.endDate = moment().day(6 + this.startOfWeekDayIndex).add("weeks", 6);

            this.weeksCollection = new CalendarCollection(null, { startDate: moment(this.startDate), endDate: moment(this.endDate), startOfWeekDayIndex: this.startOfWeekDayIndex });
        },

        initializeCalendar: function()
        {
            var weekDaysModel = new TP.Model({ weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] });

            if (this.views.calendar)
                this.views.calendar.close();
            
            this.views.calendar = new CalendarView({ model: weekDaysModel, collection: this.weeksCollection });

            this.views.calendar.on("prepend", this.prependWeekToCalendar, this);
            this.views.calendar.on("append", this.appendWeekToCalendar, this);
            this.views.calendar.on("itemMoved", this.weeksCollection.onItemMoved, this.weeksCollection);
        },

        appendWeekToCalendar: function ()
        {
            var startDate = moment(this.endDate).add("days", 1);
            var endDate = moment(startDate).add("days", 6);
            this.endDate = moment(endDate);

            this.weeksCollection.requestWorkouts(startDate, endDate);
            this.weeksCollection.appendWeek(startDate);
        },

        prependWeekToCalendar: function()
        {
            var endDate = moment(this.startDate).subtract("days", 1);
            var startDate = moment(endDate).subtract("days", 6);
            this.startDate = moment(startDate);

            this.weeksCollection.requestWorkouts(startDate, endDate);
            this.weeksCollection.prependWeek(startDate);
        }
    });
});