define(
[
    "underscore",
    "moment",
    "TP",
    "framework/clipboard",
    "models/workoutsCollection",
    "models/calendarWeekCollection",
    "models/calendarDay"
],
function(_, moment, TP, Clipboard, WorkoutsCollection, CalendarWeekCollection, CalendarDayModel)
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
            this.daysCollection.on("day:pasteMenu", this.onPasteMenuOpen, this);
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
            console.log('copied');
        },

        onItemsCut: function (model)
        {
            if (!model || !model.cutToClipboard)
                throw "Invalid cut event argument: " + model;
            
            this.clipboard.set(model.cutToClipboard(), "cut");
        },

        canPasteTo: function(dateToPasteTo)
        {
            // no data? can't paste
            if (!this.clipboard.hasData())
                return false;

            // copied data? paste anywhere
            if (this.clipboard.getAction() === "copy")
                return true;


            var cutData = this.clipboard.getValue();
            dateToPasteTo = moment(dateToPasteTo).format("YYYY-MM-DD");

            // can't paste a day back to itself
            if (cutData instanceof CalendarDayModel && dateToPasteTo === cutData.get("date"))
                return false;

            // can't paste a week/range back to same start day
            if (cutData instanceof CalendarWeekCollection && dateToPasteTo === cutData.models[0].get("date"))
                return false;

            // can't paste a workout onto the same day
            if (typeof cutData.getCalendarDay === "function" && dateToPasteTo === cutData.getCalendarDay())
                return false;

            // ok to paste
            return true;
            
        },

        onPaste: function(dateToPasteTo)
        {
            if (!this.canPasteTo(dateToPasteTo))
                return;

            var pastedItems = this.clipboard.getValue().onPaste(dateToPasteTo);
            this.addItems(pastedItems);

            if (this.clipboard.getAction() === "cut")
                this.clipboard.empty();

            console.log('pasted: ' + (pastedItems && pastedItems.length ? pastedItems.length : 1) + ' items');
        },

        onWeekSelected: function(selectedWeek)
        {
            this.selectedWeek = selectedWeek;
        },

        onWeekUnselected: function(selectedWeek)
        {
            if (this.selectedWeek === selectedWeek)
                this.selectedWeek = null;
        },

        onKeypressCopy: function(e)
        {
            if (this.selectedWeek)
            {
                this.selectedWeek.collection.trigger("week:copy", this.selectedWeek.collection);
                //theMarsApp.logger.debug("Copy from selected week");
            } else if(this.selectedRange)
            {
                this.selectedRange.trigger("week:copy", this.selectedRange);
                //theMarsApp.logger.debug("Copy from selected range");
            } else if (this.selectedDay)
            {
                this.selectedDay.trigger("day:copy", this.selectedDay);
                //theMarsApp.logger.debug("Copy from selected day");
            }

            // update paste status
            this.onPasteMenuOpen();
        
        },

        onKeypressCut: function(e)
        {
            if (this.selectedWeek)
            {
                this.selectedWeek.collection.trigger("week:cut", this.selectedWeek.collection);
                //theMarsApp.logger.debug("Cut from selected week");
            } else if(this.selectedRange)
            {
                this.selectedRange.trigger("week:cut", this.selectedRange);
                //theMarsApp.logger.debug("Cut from selected week");
            } else if(this.selectedDay)
            {
                this.selectedDay.trigger("day:cut", this.selectedDay);
                //theMarsApp.logger.debug("Cut from selected day");
            }

            // update paste status
            this.onPasteMenuOpen();
        },

        onKeypressPaste: function(e)
        {
            if (this.selectedWeek)
            {
                this.onPaste(this.selectedWeek.get("date"));
                //theMarsApp.logger.debug("Paste on selected week");
            } else if (this.selectedDay)
            {
                this.onPaste(this.selectedDay.id);
                //theMarsApp.logger.debug("Paste on selected day");
            }

            // update paste status
            this.onPasteMenuOpen();
        },

        onPasteMenuOpen: function(dateToPasteTo)
        {
            if (dateToPasteTo)
            {
                this.pasteMenuDate = dateToPasteTo;
            } else if (this.pasteMenuDate)
            {
                dateToPasteTo = this.pasteMenuDate;
            } else
            {
                return;
            }

            if (this.canPasteTo(dateToPasteTo))
            {
                this.trigger("paste:enable");
            } else
            {
                this.trigger("paste:disable");
            }
        },

        onDayClicked: function (dayModel, e)
        {
            // do we already have a selected range? unselect it and continue
            if(this.selectedRange)
            {
                this.selectedRange.unselect();
                this.selectedRange.off("range:shiftwizard", this.onShiftWizardOpen, this);
                this.selectedRange = null;
            }

            // unselect the selected day and continue, unless we're trying to select a range
            if (this.selectedDay && !e.shiftKey)
            {
                this.selectedDay.trigger("day:unselect");
                this.selectedDay.off("day:shiftwizard", this.onShiftWizardOpen, this);
                this.selectedDay = null;
            }

            // create/extend a range if shift key
            if (this.selectedDay && dayModel !== this.selectedDay && e.shiftKey)
            {
                this.selectedRange = this.createRangeOfDays(this.selectedDay.id, dayModel.id);
                this.selectedRange.select();
                this.selectedRange.on("range:shiftwizard", this.onShiftWizardOpen, this);

                // cancel default text selection behavior - also prevented through css on #calendarContainer
                document.getSelection().removeAllRanges();

                this.trigger("rangeselect", this.selectedRange, e);

                return;
            }

            // select it
            this.selectedDay = dayModel;
            this.selectedDay.on("day:shiftwizard", this.onShiftWizardOpen, this);
            dayModel.trigger("day:select");
        },

        onWeekSummarySettingsOpened: function(weekCollection, e)
        {
            if (!weekCollection)
                return;

            var firstDay = weekCollection.at(0);
            var lastDay = weekCollection.at(6);

            if (!firstDay || !lastDay)
                return;
            
            this.selectedRange = this.createRangeOfDays(moment(firstDay.get("date")), moment(lastDay.get("date")));
            this.selectedRange.select();
            this.trigger("rangeselect", this.selectedRange, e);
        },

        onWeekSummarySettingsClosed: function(weekCollection, e)
        {
            this.selectedRange.unselect();
            this.selectedRange = null;
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
            weekCollection.on("week:pasteMenu", this.onPasteMenuOpen, this);
            weekCollection.on("week:select", this.onWeekSelected, this);
            weekCollection.on("week:unselect", this.onWeekUnselected, this);
            weekCollection.on("week:shiftwizard", this.onShiftWizardOpen, this);
            weekCollection.on("weeksummary:settings:open", this.onWeekSummarySettingsOpened, this);
            weekCollection.on("weeksummary:settings:close", this.onWeekSummarySettingsClosed, this);

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

        },

        onShiftWizardOpen: function()
        {
            this.trigger("shiftwizard:open");
        }
    });
});