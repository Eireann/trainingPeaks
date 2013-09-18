define(
[
    "moment",
    "TP",
    "framework/clipboard",
    "models/calendar/calendarDay",
    "models/calendar/calendarWeekCollection",
    "shared/models/activityModel"
],
function(
    moment,
    TP,
    Clipboard,
    CalendarDayModel,
    CalendarWeekCollection,
    ActivityModel
)
{
    var calendarCollectionCopyPaste = {

        initializeCopyPaste: function()
        {
            this.clipboard = new Clipboard();
            this.subscribeToCopyPasteEvents();
            this.subscribeToSelectEvents();
            this.initializeSelectAndUnselectWorkouts();
        },

        subscribeToCopyPasteEvents: function()
        {
            this.activitiesCollection.on("workout:copy", this.onItemsCopy, this);
            this.activitiesCollection.on("workout:cut", this.onItemsCut, this);

            this.daysCollection.on("day:copy", this.onItemsCopy, this);
            this.daysCollection.on("day:cut", this.onItemsCut, this);
            this.daysCollection.on("day:paste", this.onPaste, this);
            this.daysCollection.on("day:pasteMenu", this.onPasteMenuOpen, this);
            this.daysCollection.on("day:selectAddItem", this.onSelectAddItem, this);
            this.daysCollection.on("day:unselectall", this.triggerUnSelectAll, this);
        },

        subscribeToWeekCopyPaste: function(weekCollection)
        {
            weekCollection.on("week:copy", this.onItemsCopy, this);
            weekCollection.on("week:cut", this.onItemsCut, this);
            weekCollection.on("week:paste", this.onPaste, this);
            weekCollection.on("week:pasteMenu", this.onPasteMenuOpen, this);
            weekCollection.on("week:select", this.onWeekSelected, this);
            weekCollection.on("week:unselect", this.onWeekUnselected, this);
        },

        subscribeToSelectEvents: function()
        {
            this.daysCollection.on("day:click", this.onDayClicked, this);
            this.on("calendar:unselect", this.onUnSelectCalendar, this);
        },
        
        onItemsCopy: function(model)
        {
            model = ActivityModel.unwrap(model);
            if (!model || !model.copyToClipboard)
                throw new Error("Invalid copy event argument: " + model);

            this.clipboard.set(model.copyToClipboard(), "copy");
        },

        onItemsCut: function (model)
        {
            model = ActivityModel.unwrap(model);
            if (!model || !model.cutToClipboard)
                throw new Error("Invalid cut event argument: " + model);
            
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
            dateToPasteTo = moment(dateToPasteTo).format(TP.utils.datetime.shortDateFormat);

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

            var pasteEndDate = this.getPasteEndDate(this.clipboard.getValue(), dateToPasteTo);

            var self = this;
            var handlePaste = function()
            {
                var pastedItems = self.clipboard.getValue().onPaste(dateToPasteTo);
                self.addItems(pastedItems);

                if (self.clipboard.getAction() === "cut")
                    self.clipboard.empty();
            };

            theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                theMarsApp.featureAuthorizer.features.SaveWorkoutToDate, 
                handlePaste, 
                {targetDate: pasteEndDate }
            );

        },

        getPasteEndDate: function(clipboardData, dateToPasteTo)
        {

            // pasting a range of days, calculate last day that actually contains an item
            if (clipboardData instanceof CalendarWeekCollection)
            {
                var daysWithItems = clipboardData.filter(function(day){return day.length() > 0;});
                if(daysWithItems.length)
                {
                    var lastDayWithItems = daysWithItems.pop();
                    daysToAdd = clipboardData.indexOf(lastDayWithItems);
                    return moment(dateToPasteTo).add("days", daysToAdd).format(TP.utils.datetime.shortDateFormat); 
                } 
                else
                {
                    return dateToPasteTo;
                }
            }
            else
            {
                // simple move of an item or day from one day to another
                return dateToPasteTo;
            }

        },

        onWeekSelected: function(selectedWeek)
        {
            if (this.selectedWeek)
                this.selectedWeek.unselect();

            this.selectedWeek = selectedWeek;
            this.selectedWeek.select();
            this.trigger("select");
        },

        onWeekUnselected: function(selectedWeek)
        {
            if (this.selectedWeek === selectedWeek)
            {
                this.selectedWeek.unselect();
                this.selectedWeek = null;
            }
        },

        onRangeUnselected: function(selectedRange)
        {
            if (this.selectedRange === selectedRange)
            {
                this.selectedRange.unselect();
                this.selectedRange = null;
            }
        },

        onKeypressCopy: function(e)
        {
            if (this.selectedWeek)
            {
                this.selectedWeek.trigger("week:copy", this.selectedWeek);
                //theMarsApp.logger.debug("Copy from selected week");
            } else if (this.selectedRange)
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

        getSelection: function()
        {
            if (this.selectedWeek)
            {
                return this.selectedWeek;
            } else if(this.selectedRange)
            {
                return this.selectedRange;
            } else if (this.selectedDay)
            {
                var collectionOfDays = new CalendarWeekCollection();
                collectionOfDays.push(this.selectedDay);
                return collectionOfDays;
            }

            return null;
        },

        getSelectionStartDate: function()
        {
            var selection = this.getSelection();
            if (selection && selection.length)
            {
                return selection.getStartDate();
            }
            return null;
        },

        getSelectionEndDate: function()
        {
            var selection = this.getSelection();
            if (selection && selection.length)
            {
                return selection.getEndDate();
            }
            return null;
        },

        onKeypressCut: function(e)
        {
            if (this.selectedWeek)
            {
                this.selectedWeek.trigger("week:cut", this.selectedWeek);
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
                this.onPaste(this.selectedWeek.models[0].id);
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
            // unselect model
            if (this.selectedModel)
            {
                this.selectedModel.trigger("unselect", this.selectedModel);
            }

            // do we already have a selected range? unselect it and continue
            if(this.selectedRange)
            {
                this.selectedRange.unselect();
                this.selectedRange.off("range:shiftwizard", this.onShiftWizardOpen, this);
                this.selectedRange = null;
            }

            // do we already have a selected week? unselect it and continue
            if(this.selectedWeek)
            {
                this.selectedWeek.unselect();
                this.selectedWeek = null;
            }

            // unselect the selected day and continue, unless we're trying to select a range
            if (this.selectedDay && !e.shiftKey)
            {
                this.selectedDay.trigger("day:unselect", this.selectedDay);
                this.selectedDay.off("day:shiftwizard", this.onShiftWizardOpen, this);
                this.selectedDay = null;
            }

            // create/extend a range if shift key
            if (this.selectedDay && dayModel !== this.selectedDay && e.shiftKey)
            {
                this.selectedRange = this.createRangeOfDays(this.selectedDay.id, dayModel.id);
                this.selectedRange.select();
                this.selectedRange.on("range:shiftwizard", this.onShiftWizardOpen, this);
                this.selectedRange.on("range:unselect", this.onRangeUnselected, this);

                // cancel default text selection behavior - also prevented through css on #calendarContainer
                document.getSelection().removeAllRanges();

                this.trigger("rangeselect", this.selectedRange, e);
                this.trigger("select");
                return;
            }

            // select it
            this.selectedDay = dayModel;
            this.selectedDay.on("day:shiftwizard", this.onShiftWizardOpen, this);
            dayModel.trigger("day:select");
            this.trigger("select");
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

        initializeSelectAndUnselectWorkouts: function()
        {
            this.selectedModel = null;
            this.activitiesCollection.on("select", this.onSelectWorkout, this);
            this.activitiesCollection.on("unselect", this.onUnSelectWorkout, this);
        },

        onSelectWorkout: function(model)
        {
            model = ActivityModel.unwrap(model);
            if (this.selectedModel && this.selectedModel !== model)
            {
                this.selectedModel.trigger("unselect", this.selectedModel);
            }

            this.selectedModel = model;
            model.selected = true;

            this.trigger("select");

            if(this.selectedRange)
            {
                this.selectedRange.trigger("range:unselect", this.selectedRange);
            }

            if(this.selectedWeek)
            {
                this.selectedWeek.trigger("week:unselect", this.selectedWeek);
            }

            if(this.selectedDay)
            {
                this.selectedDay.trigger("day:unselect", this.selectedDay);
            }
        },

        onUnSelectWorkout: function(model)
        {
            model = ActivityModel.unwrap(model);
            this.selectedModel = null;
            model.selected = false;
        },

        onSelectAddItem: function()
        {
            this.onUnSelectCalendar();
            this.trigger("select");
        },

        onUnSelectCalendar: function()
        {

            if (this.selectedModel)
            {
                this.selectedModel.trigger("unselect", this.selectedModel);
            }

            if(this.selectedRange)
            {
                this.selectedRange.trigger("range:unselect", this.selectedRange);
            }

            if(this.selectedWeek)
            {
                this.selectedWeek.trigger("week:unselect", this.selectedWeek);
            }

            if(this.selectedDay)
            {
                this.selectedDay.trigger("day:unselect", this.selectedDay);
            }
        },

        triggerUnSelectAll: function()
        {
            this.onUnSelectCalendar();
            this.trigger("select");
        }
    };

    return calendarCollectionCopyPaste;
});
