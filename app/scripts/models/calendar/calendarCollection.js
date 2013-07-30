define(
[
    "underscore",
    "moment",
    "TP",
    "models/workoutsCollection",
    "models/calendar/calendarWeekCollection",
    "models/calendar/calendarDay",
    "models/calendar/calendarCollectionCopyPaste",
    "models/calendar/calendarCollectionMoveAndShift"
],
function(
    _,
    moment,
    TP,
    WorkoutsCollection,
    CalendarWeekCollection,
    CalendarDayModel,
    calendarCollectionCopyPaste,
    calendarCollectionMoveAndShift
    )
{
    var CalendarSummaryModel = TP.Model.extend(
    {
        isSummary: true,
        defaults:
        {
            date: null
        }
    });

 
    var calendarCollectionBase = {

        initialize: function(models, options)
        {
            
            if (!options || !options.hasOwnProperty('startDate'))
                throw "CalendarCollection requires a start date";

            if (!options || !options.hasOwnProperty('endDate'))
                throw "CalendarCollection requires an end date";

            this.summaryViewEnabled = options.hasOwnProperty("summaryViewEnabled") ? options.summaryViewEnabled : false;

            this.workoutsCollection = new WorkoutsCollection();
            this.daysCollection = new TP.Collection();


            this.setUpWeeks(options.startDate, options.endDate);

            this.initializeCopyPaste();
            this.initializeMoveAndShift();
        },

        setUpWeeks: function(startDate, endDate)
        {
            this.startDate = startDate;
            this.endDate = endDate;

            this.workoutsCollection.reset();
            this.daysCollection.reset();

            var numOfWeeksToShow = (this.endDate.diff(this.startDate, "days") + 1) / 7;
            var i;

            for (i = 0; i < numOfWeeksToShow; i++)
            {
                var weekStartDate = moment(this.startDate).add("weeks", i);

                // Get a CalendarWeekCollection and wrap it inside a model, with its matching ID, to be able to add it to a parent collection
                var weekModel = new TP.Model({ id: weekStartDate.format(TP.utils.datetime.shortDateFormat), week: this.createWeekCollectionStartingOn(weekStartDate) });
                this.add(weekModel, { silent: false, append: true });
            }
        },

        resetToDates: function(startDate, endDate)
        {
            this.reset();
            this.selectedDay = this.selectedWeek = this.selectedRange = null;
            this.setUpWeeks(startDate, endDate);
        },
        
        createWeekCollectionStartingOn: function (startDate)
        {
            // This method return an actual Backbone.Collection.
            // Outside of here, if we want to be able to insert it into another Backbone.Collection,
            // we need to wrap it inside a Backbone.Model.
            startDate = moment(startDate);
            var weekStartDate = moment(startDate);
            var weekCollection = new CalendarWeekCollection();

           for (var dayOffset = 0; dayOffset < 7; ++dayOffset)
           {
               var day = new CalendarDayModel({ date: moment(startDate).format(TP.utils.datetime.shortDateFormat) });
                weekCollection.add(day);
                this.daysCollection.add(day);
                startDate.add("days", 1);

                if (dayOffset === 6 && this.summaryViewEnabled)
                {
                    var summary = new CalendarSummaryModel({ date: weekStartDate.format(TP.utils.datetime.shortDateFormat) });
                    weekCollection.add(summary);
                }
            }

            this.subscribeToWeekCopyPaste(weekCollection);
            this.subscribeToWeekMoveAndShift(weekCollection);

            return weekCollection;
        },

        requestWorkouts: function(startDate, endDate)
        {
            var self = this;

            self.setWeeksWaiting(moment(startDate), moment(endDate), true);
            var workouts = new WorkoutsCollection([], { startDate: moment(startDate), endDate: moment(endDate) });
            var waiting = workouts.fetch();

            // we trigger a sync event on each week model - whether they have workouts or not - to remove the waiting throbber
            // but we don't trigger the request event here to show the throbber, because the week model is not yet bound to a view,
            // so calendarView does that
            waiting.done(function ()
            {
                self.trigger("before:changes");
                workouts.each(function (workout)
                {
                    self.addWorkout(workout);
                });
                self.trigger("after:changes");
            }).always(function()
            {
                self.setWeeksWaiting(moment(startDate), moment(endDate), false);
            });

            // return the deferred so caller can use it
            return waiting;
        },

        prepareNext: function (count)
        {
            var self = this;
            var rangeStartDate = moment(this.endDate).add("days", 1);

            var models = _.times(count, function()
            {
                var startDate = moment(self.endDate).add("days", 1);
                var endDate = moment(startDate).add("days", 6);
                self.endDate = moment(endDate);

                return self.appendWeek(startDate); 
            });

            this.requestWorkouts(rangeStartDate, this.endDate);

            return models;
        },

        preparePrevious: function(count)
        {
            var self = this;
            var rangeEndDate = moment(self.startDate).subtract("days", 1);

            var models = _.times(count, function()
            {
                var endDate = moment(self.startDate).subtract("days", 1);
                var startDate = moment(endDate).subtract("days", 6);
                self.startDate = moment(startDate);

                return self.prependWeek(startDate);
            });

            this.requestWorkouts(this.startDate, rangeEndDate);

            return models.reverse();
        },

        appendWeek: function(startDate)
        {
            var newWeekCollection = this.createWeekCollectionStartingOn(moment(startDate));
            var newWeekModel = new TP.Model({ id: startDate.format(TP.utils.datetime.shortDateFormat), week: newWeekCollection });
            this.add(newWeekModel, { append: true });
            return newWeekModel;
        },

        prependWeek: function(startDate)
        {
            var newWeekCollection = this.createWeekCollectionStartingOn(startDate);
            var newWeekModel = new TP.Model({ id: startDate.format(TP.utils.datetime.shortDateFormat), week: newWeekCollection });
            this.add(newWeekModel, { at: 0, append: false });
            return newWeekModel;
        },

        getDayModel: function(date)
        {
            var formattedDate = moment(date).format(TP.utils.datetime.shortDateFormat);
            var dayModel = this.daysCollection.get(formattedDate);

            if (!dayModel)
                throw "Could not find day in days collection";

            return dayModel;
        },

        addItem: function(item)
        {
            this.addWorkout(item);
        },

        addItems: function(items)
        {
            var self = this;
            if (!items)
            {
                return;
            }
            else if (items.each && typeof items.each === "function")
            {
                items.each(function(item)
                {
                    // in case of nested collections, use addItems instead of addItem
                    self.addItems(item);
                });
            }
            else if (_.isArray(items))
            {
                _.each(items, function(item)
                {
                    // in case of nested arrays, use addItems instead of addItem
                    self.addItems(item);
                });
            }
            else
            {
                this.addItem(items);
            }
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

                // so that if we move the workout, it knows which date to remove itself from
                workout.dayCollection = dayModel;
            }
        },

        setWeeksWaiting: function(startDate, endDate, isWaiting)
        {
            startDate = startDate.format(TP.utils.datetime.shortDateFormat);
            endDate = endDate.format(TP.utils.datetime.shortDateFormat);
            this.forEach(function(weekModel)
            {
                var weekDate = weekModel.id;
                if (weekDate >= startDate && weekDate <= endDate)
                {
                    //weekModel.trigger("sync");
                    weekModel.set("isWaiting", isWaiting);
                }
            });
        },

        getWorkout: function(workoutId)
        {
            return this.workoutsCollection.get(workoutId);
        }

    };

    _.extend(calendarCollectionBase, calendarCollectionCopyPaste);
    _.extend(calendarCollectionBase, calendarCollectionMoveAndShift);

    return TP.Collection.extend(calendarCollectionBase);

});
