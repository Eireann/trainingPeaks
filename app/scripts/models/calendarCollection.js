define(
[
    "TP",
    "models/workoutsCollection",
    "models/calendarWeekCollection",
    "models/calendarDay"
],
function (TP, WorkoutsCollection, CalendarWeekCollection, CalendarDayModel)
{
    return TP.Collection.extend(
    {
        dateFormat: "YYYY-MM-DD",
        startOfWeekDayIndex: null,
        summaryViewEnabled: false,

        initialize: function(models, options)
        {
            if (!options.hasOwnProperty('startDate'))
                throw "CalendarCollection requires a start date";

            if (!options.hasOwnProperty('endDate'))
                throw "CalendarCollection requires an end date";

            this.startDate = options.startDate;
            this.endDate = options.endDate;

            this.startOfWeekDayIndex = options.hasOwnProperty("startOfWeekDayIndex") ? options.startOfWeekDayIndex : 0;
            this.workoutsCollection = new WorkoutsCollection();
            this.daysCollection = new TP.Collection();
            this.summaryViewEnabled = options.hasOwnProperty("summaryViewEnabled") ? options.summaryViewEnabled : false;

            var numOfWeeksToShow = (this.endDate.diff(this.startDate, "days") + 1) / 7;
            var i;

            if (this.length === 0)
            {
                for (i = 0; i < numOfWeeksToShow; i++)
                {
                    var weekStartDate = moment(this.startDate).add("weeks", i);

                    // Get a CalendarWeekCollection and wrap it inside a model, with its matching ID, to be able to add it to a parent collection
                    var weekModel = new TP.Model({ id: weekStartDate.format(this.dateFormat), week: this.createWeekCollectionStartingOn(weekStartDate) });
                    this.add(weekModel, { silent: true });
                }
            }
        },
        
        createWeekCollectionStartingOn: function (startDate)
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
                this.daysCollection.add(day);
                startDate.add("days", 1);

                if (dayOffset === 6 && this.summaryViewEnabled)
                {
                    var summary = new CalendarSummaryModel();
                    weekCollection.add(summary);
                }
            }

            return weekCollection;
        },

        requestWorkouts: function(startDate, endDate)
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
                    self.addWorkout(workout);
                });
                self.stopWeeksWaiting(moment(startDate), moment(endDate));
            });
        },

        appendWeek: function(startDate)
        {
            var newWeekCollection = this.createWeekCollectionStartingOn(moment(startDate));
            var newWeekModel = new TP.Model({ id: startDate.format(this.dateFormat), week: newWeekCollection });

            this.add(newWeekModel, { append: true });
        },

        prependWeek: function(startDate)
        {
            var newWeekCollection = this.createWeekCollectionStartingOn(startDate);
            var newWeekModel = new TP.Model({ id: startDate.format(this.dateFormat), week: newWeekCollection });

            this.add(newWeekModel, { at: 0, append: false });
        },

        getDayModel: function(date)
        {
            var formattedDate = moment(date).format(this.dateFormat);
            var dayModel = this.daysCollection.get(formattedDate);

            if (!dayModel)
                throw "Could not find day in days collection";

            return dayModel;
        },

        addWorkout: function(workout)
        {
            this.workoutsCollection.add(workout);
            this.addWorkoutToCalendarDay(workout);
        },

        addWorkoutToCalendarDay: function(workout)
        {
            var workoutDay = workout.getCalendarDay();
            if (workoutDay)
            {
                var dayModel = this.getDayModel(workoutDay);
                dayModel.add(workout);
            }
        },

        stopWeeksWaiting: function(startDate, endDate)
        {
            startDate = startDate.format(this.dateFormat);
            endDate = endDate.format(this.dateFormat);
            this.forEach(function(weekModel)
            {
                var weekDate = weekModel.id;
                if (weekDate >= startDate && weekDate <= endDate)
                {
                    weekModel.trigger("sync");
                }
            });
        },

        onItemMoved: function(options)
        {
            if (!options.hasOwnProperty('ItemId') || !options.ItemId ||
                !options.hasOwnProperty('destinationCalendarDayModel') || !options.destinationCalendarDayModel)
            {
                theMarsApp.logger.debug("CalendarCollection.onItemMoved: missing ItemId or destinationCalendarDayModel attribute?");
                return;
            }

            // get the item
            var item = this.workoutsCollection.get(options.ItemId);

            // if it has a getCalendarDay and moveToDay then we can move it
            if (item && _.isFunction(item.getCalendarDay) && _.isFunction(item.moveToDay))
            {
                var oldCalendarDay = item.getCalendarDay();
                var newCalendarDay = options.destinationCalendarDayModel.id;

                if (oldCalendarDay !== newCalendarDay)
                {

                    var sourceCalendarDayModel = this.getDayModel(oldCalendarDay);

                    var onFail = function ()
                    {
                        // if it fails, move it back
                        sourceCalendarDayModel.add(item);
                        options.destinationCalendarDayModel.remove(item);
                        //TODO controller.onError('Server Error: Unable to move item');
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