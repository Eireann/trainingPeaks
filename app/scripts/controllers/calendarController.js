define(
    [
    "moment",
    "TP",
    "layouts/calendarLayout",
    "models/calendarWeekCollection",
    "models/calendarDay",
    "views/calendarView",
    "models/workoutsCollection"
    ],
function (moment, TP, CalendarLayout, CalendarWeekCollection, CalendarDayModel, CalendarView, WorkoutsCollection)
{
    return TP.Controller.extend(
    {
        layout: null,
        views: null,
        weeksCollection: null,
        workoutsCollection: null,

        startOfWeekDayIndex: 0,

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
            this.collectionOfWeeks = new TP.Collection();

            // start on a Sunday
            this.startDate = moment().day(this.startOfWeekDayIndex).subtract("weeks", 4);

            // end on a Saturday
            this.endDate = moment().day(6 + this.startOfWeekDayIndex).add("weeks", 6);

            this.initializeCalendar();
            this.requestWorkouts(this.startDate, this.endDate);
        },

        initializeCalendar: function()
        {
            var weekDaysModel = new TP.Model({ weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] });

            var numOfWeeksToShow = (this.endDate.diff(this.startDate, "days") + 1) / 7;
            var i;
            
            for (i = 0; i < numOfWeeksToShow; i++)
            {
                var weekStartDate = moment(this.startDate).add("weeks", i);

                // Get a CalendarWeekCollection and wrap it inside a model, with its matching ID, to be able to add it to a parent collection
                var weekModel = new TP.Model({ id: weekStartDate.format("YYYY-MM-DD"), week: this.createWeekCollectionStartingOn(weekStartDate) });
                this.collectionOfWeeks.add(weekModel, { silent: true });
            }

            this.views.calendar = new CalendarView({ model: weekDaysModel, collection: this.collectionOfWeeks });

            this.views.calendar.bind("prepend", this.prependWeekToCalendar);
            this.views.calendar.bind("append", this.appendWeekToCalendar);
            this.views.calendar.bind("workoutMoved", this.onWorkoutMoved);
            
        },

        createWeekCollectionStartingOn: function(startDate)
        {
            // This method return an actual Backbone.Collection.
            // Later, if we want to be able to insert it into another Backbone.Collection,
            // we need to wrap it inside a Backbone.Model.
            var weekCollection = new CalendarWeekCollection();

            for (var dayOffset = 0; dayOffset < 7; ++dayOffset)
            {
                var day = new CalendarDayModel({ date: moment(startDate) });
                weekCollection.add(day);
                startDate.add("days", 1);
            }

            return weekCollection;
        },

        requestWorkouts: function (startDate, endDate)
        {
            var workouts = new WorkoutsCollection([], { startDate: moment(startDate), endDate: moment(endDate) });

            var waiting = workouts.fetch();
            var self = this;

            waiting.done(function ()
            {
                workouts.each(function (workout)
                {
                    self.addWorkoutToCalendarDay(workout);
                    self.workoutsCollection.add(workout);
                });
            });
        },

        addWorkoutToCalendarDay: function(workout)
        {
            var workoutDay = workout.getCalendarDate();
            if (workoutDay)
            {
                var weekModel = this.collectionOfWeeks.get(moment(workoutDay).day(this.startOfWeekDayIndex).format("YYYY-MM-DD"));
                if (!weekModel)
                    return;
                
                var dayModel = weekModel.get("week").get(workoutDay);
                if (!dayModel)
                    return;
                
                dayModel.addWorkout(workout);
            }
        },

        appendWeekToCalendar: function()
        {
            var startDate = moment(this.endDate).add("days", 1);
            var endDate = moment(startDate).add("days", 6);
            this.endDate = moment(endDate);

            this.requestWorkouts(startDate, endDate);
            var newWeekCollection = this.createWeekCollectionStartingOn(moment(startDate));
            var newWeekModel = new TP.Model({ id: startDate.format("YYYY-MM-DD"), week: newWeekCollection });

            this.collectionOfWeeks.add(newWeekModel, { append: true });
        },

        prependWeekToCalendar: function()
        {
            var endDate = moment(this.startDate).subtract("days", 1);
            var startDate = moment(endDate).subtract("days", 6);
            this.startDate = moment(startDate);

            this.requestWorkouts(startDate, endDate);
            var newWeekCollection = this.createWeekCollectionStartingOn(startDate);
            var newWeekModel = new TP.Model({ id: startDate.format("YYYY-MM-DD"), week: newWeekCollection });

            this.collectionOfWeeks.add(newWeekModel, { at: 0, append: false });
        },

        onWorkoutMoved: function (options)
        {

            // get the workout
            var workout = this.workoutsCollection.get(options.workoutId);
            var oldWorkoutDay = workout.getCalendarDate();
            var newWorkoutDay = options.destinationCalendarDayModel.id;


            if (oldWorkoutDay !== newWorkoutDay)
            {
                // remove it from the current day
                var oldWorkoutWeek = moment(oldWorkoutDay).day(this.startOfWeekDayIndex);

                if (!this.collectionOfWeeks.get(oldWorkoutWeek.format("YYYY-MM-DD")))
                    throw "Could not find week for source day";
                
                var sourceCalendarDayModel = this.collectionOfWeeks.get(oldWorkoutWeek.format("YYYY-MM-DD")).get("week").get(oldWorkoutDay);

                // set the date, and move back if failed
                sourceCalendarDayModel.removeWorkout(workout);

                // set the date
                workout.moveToDay(newWorkoutDay).fail(function()
                {
                    // if it fails, move it back
                    sourceCalendarDayModel.addWorkout(workout);
                    options.destinationCalendarDayModel.removeWorkout(workout);
                });

                // add it to the new day
                options.destinationCalendarDayModel.addWorkout(workout);
            }

        }
    });
});