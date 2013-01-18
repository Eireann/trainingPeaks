define(
[
    "backbone",
    "backbone.marionette",
    "moment",
    "layouts/calendarLayout",
    "models/calendarDay",
    "views/calendarView",
    "models/workoutsCollection"
],
function (Backbone, Marionette, moment, CalendarLayout, CalendarDayModel, CalendarView, WorkoutsCollection)
{
    return Marionette.Controller.extend(
    {
        layout: new CalendarLayout(),

        views: {},
        daysCollection: null,
        daysHash: {},

        show: function ()
        {
            this.layout.mainRegion.show(this.views.calendar);
        },

        initialize: function ()
        {
            _.bindAll(this);

            // start on a Sunday
            this.startDate = moment().day(0).subtract("weeks", 4);

            // end on a Saturday
            this.endDate = moment().day(6).add("weeks", 6);

            var formatstring = "dddd YYYY-MM-DD";

            this.initializeCalendar();
            this.requestWorkouts(this.startDate, this.endDate);
        },

        initializeCalendar: function ()
        {
            this.daysCollection = this.createCollectionOfDays(moment(this.startDate), moment(this.endDate));
            this.views.calendar = new CalendarView({ collection: this.daysCollection });

            this.views.calendar.bind("prepend", this.prependWeekToCalendar);
            this.views.calendar.bind("append", this.appendWeekToCalendar);
        },

        createCollectionOfDays: function (startDate, endDate)
        {

            // add one to endDate.diff, to include endDate itself
            var numOfDaysToShow = endDate.diff(startDate, "days") + 1;

            var daysCollection = new Backbone.Collection();

            for (var dayOffset = 0; dayOffset < numOfDaysToShow; ++dayOffset)
            {
                var day = new CalendarDayModel({ date: moment(startDate) });
                this.daysHash[startDate.format("YYYY-MM-DD")] = day;
                daysCollection.add(day);
                startDate.add("days", 1);
            }

            return daysCollection;
        },

        requestWorkouts: function (startDate, endDate)
        {
            var workouts = new WorkoutsCollection({ startDate: moment(startDate), endDate: moment(endDate) });

            var waiting = workouts.fetch();
            var that = this;

            waiting.done(function ()
            {
                workouts.each(function (workout)
                {
                    var workoutDay = workout.get("WorkoutDay");
                    if (workoutDay)
                    {
                        workoutDay = workoutDay.substr(0, workoutDay.indexOf("T"));
                        if (that.daysHash[workoutDay])
                        {
                            that.daysHash[workoutDay].set("workoutId", workout.get("WorkoutId"));
                            that.daysHash[workoutDay].set("workoutDay", workout.get("WorkoutDay"));
                        }
                    }
                });
            });
        },

        appendWeekToCalendar: function ()
        {
            var startDate = moment(this.endDate).add("days", 1);
            var endDate = moment(startDate).add("days", 6);
            this.endDate = moment(endDate);

            this.requestWorkouts(startDate, endDate);
            var newDays = this.createCollectionOfDays(startDate, endDate);

            // index option tells view whether we're appending or prepending
            this.daysCollection.add(newDays.models, { index: this.daysCollection.length });
        },

        prependWeekToCalendar: function ()
        {
            var endDate = moment(this.startDate).subtract("days", 1);
            var startDate = moment(endDate).subtract("days", 6);
            this.startDate = moment(startDate);

            this.requestWorkouts(startDate, endDate);
            var newDays = this.createCollectionOfDays(startDate, endDate);

            // unshift doesn't accept a collection, but add does, using the 'at' option for index
            this.daysCollection.add(newDays.models, { index: 0, at: 0 });
        }
    });
});