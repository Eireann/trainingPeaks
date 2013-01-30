define(
[
    "moment",
    "TP",
    "layouts/calendarLayout",
    "models/calendarDaysCollection",
    "models/calendarDay",
    "views/customCalendarView",
    "models/workoutsCollection"
],
function(moment, TP, CalendarLayout, CalendarDaysCollection, CalendarDayModel, CalendarView, WorkoutsCollection)
{
    return TP.Controller.extend(
    {
        layout: null,
        views: null,
        daysCollection: null,
        workoutsCollection: null,

        show: function()
        {
            this.layout.mainRegion.show(this.views.calendar);
        },

        initialize: function()
        {
            _.bindAll(this);

            // initialize these here instead of in extend, otherwise they become members of the prototype
            this.layout = new CalendarLayout();
            this.views = {};
            this.workoutsCollection = new WorkoutsCollection();

            // start on a Sunday
            this.startDate = moment().day(0).subtract("weeks", 4);

            // end on a Saturday
            this.endDate = moment().day(6).add("weeks", 6);

            this.initializeCalendar();
            this.requestWorkouts(this.startDate, this.endDate);
        },

        initializeCalendar: function()
        {
            var weekDaysModel = new Backbone.Model({ weekDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] });
            this.daysCollection = this.createCollectionOfDays(moment(this.startDate), moment(this.endDate));
            this.views.calendar = new CalendarView({ model: weekDaysModel, collection: this.daysCollection });

            this.views.calendar.bind("prepend", this.prependWeekToCalendar);
            this.views.calendar.bind("append", this.appendWeekToCalendar);
            this.views.calendar.bind("workoutMoved", this.onWorkoutMoved);
            
        },

        createCollectionOfDays: function(startDate, endDate)
        {

            // so we don't modify a caller's date
            startDate = moment(startDate);

            // add one to endDate.diff, to include endDate itself
            var numOfDaysToShow = endDate.diff(startDate, "days") + 1;

            var daysCollection = new CalendarDaysCollection();

            for (var dayOffset = 0; dayOffset < numOfDaysToShow; ++dayOffset)
            {
                var day = new CalendarDayModel({ date: moment(startDate) });
                daysCollection.add(day);
                startDate.add("days", 1);
            }

            return daysCollection;
        },

        requestWorkouts: function(startDate, endDate)
        {

            var workouts = new WorkoutsCollection([], { startDate: moment(startDate), endDate: moment(endDate) });

            var waiting = workouts.fetch();
            var controller = this;

            waiting.done(function()
            {
                workouts.each(function (workout)
                {
                    controller.addWorkoutToCalendarDay(workout);
                    controller.workoutsCollection.add(workout);
                });
            });
        },

        addWorkoutToCalendarDay: function(workout)
        {
            var workoutDay = workout.getCalendarDate();
            if (workoutDay)
            {
                var dayModel = this.daysCollection.get(workoutDay);
                if (dayModel)
                {
                    dayModel.addWorkout(workout);
                }
            }
        },

        appendWeekToCalendar: function()
        {
            var startDate = moment(this.endDate).add("days", 1);
            var endDate = moment(startDate).add("days", 6);
            this.endDate = moment(endDate);

            this.requestWorkouts(startDate, endDate);
            var newDays = this.createCollectionOfDays(startDate, endDate);

            // index option tells calendarView whether we're appending or prepending
            this.daysCollection.add(newDays.models, { index: this.daysCollection.length });
        },

        prependWeekToCalendar: function()
        {
            var endDate = moment(this.startDate).subtract("days", 1);
            var startDate = moment(endDate).subtract("days", 6);
            this.startDate = moment(startDate);

            this.requestWorkouts(startDate, endDate);
            var newDays = this.createCollectionOfDays(startDate, endDate);

            // unshift doesn't accept a collection, but add does, using the 'at' option for index
            // and our calendarView needs the index option to append or prepend
            this.daysCollection.add(newDays.models, { index: 0, at: 0 });
        },

        onWorkoutMoved: function(workoutid, destinationCalendarDayModel)
        {

            // get the workout
            var workout = this.workoutsCollection.get(workoutid);
            var oldWorkoutDay = workout.getCalendarDate();
            var newWorkoutDay = destinationCalendarDayModel.id;


            if (oldWorkoutDay !== newWorkoutDay)
            {
                // remove it from the current day
                var sourceCalendarDayModel = this.daysCollection.get(oldWorkoutDay);

                // set the date, and move back if failed
                sourceCalendarDayModel.removeWorkout(workout);

                // set the date
                workout.moveToDay(newWorkoutDay).fail(

                    // if it fails, move it back
                    function()
                    {
                        sourceCalendarDayModel.addWorkout(workout);
                        destinationCalendarDayModel.removeWorkout(workout);
                    }
                );

                // add it to the new day
                destinationCalendarDayModel.addWorkout(workout);
            }

        }
    });
});