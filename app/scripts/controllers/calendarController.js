define(
    [
    "underscore",
    "moment",
    "TP",
    "layouts/calendarLayout",
    "models/calendarCollection",
    "models/calendarWeekCollection",
    "models/calendarDay",
    "views/calendarView",
    "models/workoutsCollection"
    ],
function (_, moment, TP, CalendarLayout, CalendarCollection, CalendarWeekCollection, CalendarDayModel, CalendarView, WorkoutsCollection)
{
    return TP.Controller.extend(
    {
        views: {},

        startOfWeekDayIndex: 0,
        summaryViewEnabled: true,

        show: function()
        {
            this.initializeCalendar();
            this.requestWorkouts(this.startDate, this.endDate);
            this.layout.mainRegion.show(this.views.calendar);
        },

        initialize: function ()
        {
            this.layout = new CalendarLayout();
            this.layout.on("show", this.show, this);

            this.dateFormat = "YYYY-MM-DD";
            this.workoutsCollection = new WorkoutsCollection();
            this.collectionOfWeeks = new CalendarCollection();

            // start on a Sunday
            this.startDate = moment().day(this.startOfWeekDayIndex).subtract("weeks", 4);

            // end on a Saturday
            this.endDate = moment().day(6 + this.startOfWeekDayIndex).add("weeks", 6);
        },

        initializeCalendar: function()
        {
            var weekDaysModel = new TP.Model({ weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] });

            var numOfWeeksToShow = (this.endDate.diff(this.startDate, "days") + 1) / 7;
            var i;

            if (this.collectionOfWeeks.length === 0)
            {
                for (i = 0; i < numOfWeeksToShow; i++)
                {
                    var weekStartDate = moment(this.startDate).add("weeks", i);

                    // Get a CalendarWeekCollection and wrap it inside a model, with its matching ID, to be able to add it to a parent collection
                    var weekModel = new TP.Model({ id: weekStartDate.format(this.dateFormat), week: this.createWeekCollectionStartingOn(weekStartDate) });
                    this.collectionOfWeeks.add(weekModel, { silent: true });
                }
            }

            if (this.views.calendar)
                this.views.calendar.close();
            
            this.views.calendar = new CalendarView({ model: weekDaysModel, collection: this.collectionOfWeeks });

            this.views.calendar.on("prepend", this.prependWeekToCalendar, this);
            this.views.calendar.on("append", this.appendWeekToCalendar, this);
            this.views.calendar.on("itemMoved", this.onItemMoved, this);
        },

        createWeekCollectionStartingOn: function(startDate)
        {
            // This method return an actual Backbone.Collection.
            // Later, if we want to be able to insert it into another Backbone.Collection,
            // we need to wrap it inside a Backbone.Model.
            startDate = moment(startDate);
            var weekCollection = new CalendarWeekCollection();

            var CalendarSummaryModel = TP.Model.extend(
            {
                isSummary: true
            });

            for (var dayOffset = 0; dayOffset < 7; ++dayOffset)
            {
                var day = new CalendarDayModel({ date: moment(startDate) });
                weekCollection.add(day);
                startDate.add("days", 1);

                if (dayOffset === 6 && this.summaryViewEnabled)
                {
                    var summary = new CalendarSummaryModel();
                    weekCollection.add(summary);
                }
            }

            return weekCollection;
        },

        requestWorkouts: function (startDate, endDate)
        {
            var workouts = new WorkoutsCollection([], { startDate: moment(startDate), endDate: moment(endDate) });

            var waiting = workouts.fetch();
            var self = this;

            // we trigger a sync event on each week model - whether they have workouts or not - to remove the waiting throbber
            // but we don't trigger the request event here to show the throbber, because the week model is not yet bound to a view,
            // so calendarView does that
            waiting.done(function ()
            {
                workouts.each(function (workout)
                {
                    self.addWorkoutToCalendarDay(workout);
                    self.workoutsCollection.add(workout);
                });
                self.stopWeeksWaiting(moment(startDate), moment(endDate));
            });
        },

        stopWeeksWaiting: function(startDate, endDate)
        {
            startDate = startDate.format(this.dateFormat);
            endDate = endDate.format(this.dateFormat);
            this.collectionOfWeeks.forEach(function(weekModel)
            {
                var weekDate = weekModel.id;
                if (weekDate >= startDate && weekDate <= endDate)
                {
                    weekModel.trigger("sync");
                }
            });
        },

        addWorkoutToCalendarDay: function(workout)
        {
            var workoutDay = workout.getCalendarDay();
            if (workoutDay)
            {
                var dayModel = this.collectionOfWeeks.getDayModel(workoutDay, this.startOfWeekDayIndex);
                dayModel.add(workout);
            }
        },

        appendWeekToCalendar: function()
        {
            var startDate = moment(this.endDate).add("days", 1);
            var endDate = moment(startDate).add("days", 6);
            this.endDate = moment(endDate);

            this.requestWorkouts(startDate, endDate);
            var newWeekCollection = this.createWeekCollectionStartingOn(moment(startDate));
            var newWeekModel = new TP.Model({ id: startDate.format(this.dateFormat), week: newWeekCollection });

            this.collectionOfWeeks.add(newWeekModel, { append: true });
        },

        prependWeekToCalendar: function()
        {
            var endDate = moment(this.startDate).subtract("days", 1);
            var startDate = moment(endDate).subtract("days", 6);
            this.startDate = moment(startDate);

            this.requestWorkouts(startDate, endDate);
            var newWeekCollection = this.createWeekCollectionStartingOn(startDate);
            var newWeekModel = new TP.Model({ id: startDate.format(this.dateFormat), week: newWeekCollection });

            this.collectionOfWeeks.add(newWeekModel, { at: 0, append: false });
        },
        
        onItemMoved: function (options)
        {
            // get the item
            var item = this.workoutsCollection.get(options.itemId);

            // if it has a getCalendarDay and moveToDay then we can move it
            if (_.isFunction(item.getCalendarDay) && _.isFunction(item.moveToDay))
            {
                var oldCalendarDay = item.getCalendarDay();
                var newCalendarDay = options.destinationCalendarDayModel.id;
                var controller = this;

                if (oldCalendarDay !== newCalendarDay)
                {

                    var sourceCalendarDayModel = this.collectionOfWeeks.getDayModel(oldCalendarDay, this.startOfWeekDayIndex);
                    
                    var onFail = function()
                    {
                        // if it fails, move it back
                        sourceCalendarDayModel.add(item);
                        options.destinationCalendarDayModel.remove(item);
                        controller.onError('Server Error: Unable to move item');
                    };

                    // move it
                    sourceCalendarDayModel.remove(item);
                    options.destinationCalendarDayModel.add(item);
                    item.moveToDay(newCalendarDay).fail(onFail);
                }
            }

        }
    });
});