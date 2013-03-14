define(
[
    "underscore",
    "TP",
    "framework/clipboard",
    "models/workoutsCollection",
    "models/calendarWeekCollection",
    "models/calendarDay"
],
function(_, TP, Clipboard, WorkoutsCollection, CalendarWeekCollection, CalendarDayModel)
{
    return TP.Collection.extend(
    {
        dateFormat: "YYYY-MM-DD",

        initialize: function(models, options)
        {
            this.clipboard = new Clipboard();
            
            if (!options || !options.hasOwnProperty('startDate'))
                throw "CalendarCollection requires a start date";

            if (!options || !options.hasOwnProperty('endDate'))
                throw "CalendarCollection requires an end date";

            this.summaryViewEnabled = options.hasOwnProperty("summaryViewEnabled") ? options.summaryViewEnabled : false;

            this.workoutsCollection = new WorkoutsCollection();
            this.daysCollection = new TP.Collection();

            this.daysCollection.on("workout:added", this.addItem, this);

            this.subscribeToCopyPasteEvents();
            this.subscribeToSelectEvents();

            this.setUpWeeks(options.startDate, options.endDate);
        },

        subscribeToCopyPasteEvents: function()
        {
            this.workoutsCollection.on("workout:copy", this.onItemsCopy, this);
            this.workoutsCollection.on("workout:cut", this.onItemsCut, this);

            this.daysCollection.on("day:copy", this.onItemsCopy, this);
            this.daysCollection.on("day:cut", this.onItemsCut, this);
            this.daysCollection.on("day:paste", this.onPaste, this);

            this.clipboard.on("change", this.onClipboardStateChange, this);
        },

        subscribeToSelectEvents: function()
        {
            this.daysCollection.on("day:click", this.onDayClicked, this);
        },
        
        onItemsCopy: function(model)
        {
            if (!model || !model.copyToClipboard)
                throw "Invalid copy event argument: " + model;
            
            this.clipboard.set(model.copyToClipboard(), "copy");
        },

        onItemsCut: function (model)
        {
            if (!model || !model.cutToClipboard)
                throw "Invalid cut event argument: " + model;
            
            this.clipboard.set(model.cutToClipboard(), "cut");
        },

        onPaste: function(dateToPasteTo)
        {
            if (!this.clipboard.hasData())
                return;

            var pastedItems = this.clipboard.getValue().onPaste(dateToPasteTo);
            this.addItems(pastedItems);

            if (this.clipboard.getAction() === "cut")
                this.clipboard.empty();
        },

        onKeypressCopy: function(e)
        {
            if(this.selectedRange)
            {
                this.selectedRange.trigger("week:copy", this.selectedRange);
            } else if(this.selectedDay)
            {
                this.selectedDay.trigger("day:copy", this.selectedDay);
            }
        
        },

        onKeypressCut: function(e)
        {
            if(this.selectedRange)
            {
                this.selectedRange.trigger("week:cut", this.selectedRange);
            } else if(this.selectedDay)
            {
                this.selectedDay.trigger("day:cut", this.selectedDay);
            }
        },

        onKeypressPaste: function(e)
        {
            if (this.selectedDay)
            {
                this.onPaste(this.selectedDay.id);
            }
        },

        onClipboardStateChange: function()
        {
            if (this.clipboard.hasData())
            {
                this.trigger("clipboard:full");
            } else
            {
                this.trigger("clipboard:empty");
            }
        },

        onDayClicked: function(dayModel, e)
        {

            // do we already have a selected range? unselect it and continue
            if(this.selectedRange)
            {
                this.selectedRange.unselect();
                this.selectedRange = null;
            }

            // unselect the selected day and continue, unless we're trying to select a range
            if (this.selectedDay && !e.shiftKey)
            {
                this.selectedDay.trigger("day:unselect");
                this.selectedDay = null;
            }

            // create/extend a range if shift key
            if (this.selectedDay && dayModel !== this.selectedDay && e.shiftKey)
            {
                this.selectedRange = this.createRangeOfDays(this.selectedDay.id, dayModel.id);
                this.selectedRange.select();

                // cancel default text selection behavior - also prevented through css on #calendarContainer
                document.getSelection().removeAllRanges();

                this.trigger("rangeselect", this.selectedRange, e);

                return;
            }

            // select it
            this.selectedDay = dayModel;
            dayModel.trigger("day:select");
        },

        createRangeOfDays: function(selectionStartDay, selectionEndDay)
        {
            var startDay = selectionEndDay < selectionStartDay ? moment(selectionEndDay) : moment(selectionStartDay);
            var endDay = selectionStartDay > selectionEndDay ? moment(selectionStartDay) : moment(selectionEndDay);
            var currentDay = moment(startDay);
            var collectionOfDays = new CalendarWeekCollection();
            while (endDay.diff(currentDay, "days") >= 0)
            {
                collectionOfDays.push(this.getDayModel(currentDay));
                currentDay.add("days", 1);
            }

            collectionOfDays.on("week:copy", this.onItemsCopy, this);
            collectionOfDays.on("week:cut", this.onItemsCut, this);
            return collectionOfDays;
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
                var weekModel = new TP.Model({ id: weekStartDate.format(this.dateFormat), week: this.createWeekCollectionStartingOn(weekStartDate) });
                this.add(weekModel, { silent: false, append: true });
            }
        },

        resetToDates: function(startDate, endDate)
        {
            this.reset();
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

            var CalendarSummaryModel = TP.Model.extend(
            {
                isSummary: true,
                defaults:
                {
                    date: null
                }
            });

            for (var dayOffset = 0; dayOffset < 7; ++dayOffset)
            {
                var day = new CalendarDayModel({ date: moment(startDate) });
                weekCollection.add(day);
                this.daysCollection.add(day);
                startDate.add("days", 1);

                if (dayOffset === 6 && this.summaryViewEnabled)
                {
                    var summary = new CalendarSummaryModel({ date: weekStartDate.format(this.dateFormat) });
                    weekCollection.add(summary);
                }
            }

            weekCollection.on("week:copy", this.onItemsCopy, this);
            weekCollection.on("week:cut", this.onItemsCut, this);
            weekCollection.on("week:paste", this.onPaste, this);

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

            // return the deferred so caller can use it
            return waiting;
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
                    item.moveToDay(newCalendarDay, options.destinationCalendarDayModel);
                }
            }

        }
    });
});