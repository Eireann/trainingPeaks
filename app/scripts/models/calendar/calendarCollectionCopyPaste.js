define(
[
    "moment",
    "TP",
    "framework/clipboard",
    "models/calendar/calendarDay",
    "models/calendar/calendarWeekCollection"
],
function(
    moment,
    TP,
    Clipboard,
    CalendarDayModel,
    CalendarWeekCollection
    )
{
    var calendarCollectionCopyPaste = {

        initializeCopyPaste: function()
        {
            this.clipboard = new Clipboard();
            this.subscribeToCopyPasteEvents();
            this.subscribeToSelectEvents();
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

            var pastedItems = this.clipboard.getValue().onPaste(dateToPasteTo);
            this.addItems(pastedItems);

            if (this.clipboard.getAction() === "cut")
                this.clipboard.empty();

        },

        onWeekSelected: function(selectedWeek)
        {
            if (this.selectedWeek)
                this.selectedWeek.unselect();

            this.selectedWeek = selectedWeek;
            this.selectedWeek.select();
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
                this.selectedRange.on("range:unselect", this.onRangeUnselected, this);

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
        }

    };

    return calendarCollectionCopyPaste;
});