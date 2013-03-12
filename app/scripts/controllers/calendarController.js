define(
[
    "underscore",
    "moment",
    "setImmediate",
    "TP",
    "layouts/calendarLayout",
    "models/calendarCollection",
    "models/calendarWeekCollection",
    "models/calendarDay",
    "models/library/libraryExercisesCollection",
    "models/workoutModel",
    "views/calendarHeaderView",
    "views/calendarContainerView",
    "views/library/libraryView"
],
function(_, moment, setImmediate, TP, CalendarLayout, CalendarCollection, CalendarWeekCollection,
         CalendarDayModel, LibraryExercisesCollection, WorkoutModel, CalendarHeaderView, CalendarContainerView, LibraryView)
{
    return TP.Controller.extend(
    {
        summaryViewEnabled: true,

        show: function()
        {
            this.initializeHeader();
            this.initializeCalendar();
            this.initializeLibrary();

            this.showViewsInRegions();

            // load the calendar, and aggregate all of the deferreds from each workout request
            this.showDate(moment());
            var calendarDeferreds = this.loadCalendarData();
            this.scrollToTodayAfterLoad(calendarDeferreds);

            this.loadLibraryData();

            this.watchClipboard();
        }, 

        showViewsInRegions: function()
        {
            this.layout.headerRegion.show(this.views.header);
            this.layout.calendarRegion.show(this.views.calendar);
            this.layout.libraryRegion.show(this.views.library);
        },

        scrollToTodayAfterLoad: function(deferreds)
        {
            var ajaxCachingDeferreds = [];
            _.each(deferreds, function(deferred)
            {
                if (deferred.hasOwnProperty("ajaxCachingDeferred"))
                {
                    ajaxCachingDeferreds.push(deferred.ajaxCachingDeferred);
                }
            });

            // once all of the data has loaded, set a timeout to allow repainting, then scroll to today
            var calendarController = this;
            calendarController.wasScrolled = false;
            var scrollIt = function()
            {
                if (!calendarController.wasScrolled)
                {
                    calendarController.wasScrolled = true;
                    setImmediate(function() { calendarController.showDate(moment(), 500); });
                }
            };

            if (ajaxCachingDeferreds.length > 0)
            {
                $.when.apply($, ajaxCachingDeferreds).then(scrollIt);
            }

            $.when.apply($, deferreds).then(scrollIt);

        },

        loadCalendarData: function()
        {

            //theMarsApp.logger.startTimer("CalendarController", "begin request calendar data");
            // don't make requests until after we display, or else localStorage cache synchronous read blocks browser rendering
            var diff = this.endDate.diff(this.startDate, "weeks");
            var deferreds = [];
            for (var i = 0; i < diff; i++)
            {
                var startDate = moment(this.startDate).add("weeks", i);
                var endDate = moment(startDate).add("days", 6);
                var deferred = this.weeksCollection.requestWorkouts(startDate, endDate);
                deferreds.push(deferred);
            }

            //theMarsApp.logger.logTimer("CalendarController", "finished request calendar data");
            return deferreds;
        },

        loadLibraryData: function()
        {
            for (var libraryName in this.libraryCollections)
                this.libraryCollections[libraryName].fetch();
        },

        watchClipboard: function()
        {
            this.weeksCollection.on("clipboard:full", this.onClipboardFull, this);
            this.weeksCollection.on("clipboard:empty", this.onClipboardEmpty, this);
            this.onClipboardEmpty();
        },

        onClipboardFull: function()
        {
            $('body').removeClass('clipboardEmpty').addClass('clipboardFull');
        },

        onClipboardEmpty: function()
        {
            $('body').removeClass('clipboardFull').addClass('clipboardEmpty');
        },

        createStartDay: function(startDate)
        {
            var startMoment = startDate ? moment(startDate) : moment();
            return startMoment.day(this.startOfWeekDayIndex);
        },

        createEndDay: function(endDate)
        {
            var endMoment = endDate ? moment(endDate) : moment();
            return endMoment.day(6 + this.startOfWeekDayIndex);
        },

        initialize: function()
        {
            this.models = {};
            this.views = {};

            this.startOfWeekDayIndex = 1;
            
            this.layout = new CalendarLayout();
            this.layout.on("show", this.show, this);

            this.dateFormat = "YYYY-MM-DD";

            this.startDate = this.createStartDay().subtract("weeks", 4);
            this.endDate = this.createEndDay().add("weeks", 6);

            this.weeksCollection = new CalendarCollection(null,
            {
                summaryViewEnabled: this.summaryViewEnabled,
                startDate: moment(this.startDate),
                endDate: moment(this.endDate)
            });
        },

        reset: function(startDate, endDate)
        {
            this.views.calendar.fadeOut(800);
            this.startDate = moment(startDate);
            this.endDate = moment(endDate);
            this.weeksCollection.resetToDates(moment(this.startDate), moment(this.endDate));
            this.loadCalendarData();
            this.views.calendar.fadeIn(800);
        },

        showDate: function(dateAsMoment, effectDuration)
        {
            if (!dateAsMoment)
                return;


            var calendarView = this.views.calendar;
            var i;

            if (dateAsMoment.day() !== this.startOfWeekDayIndex)
            {
                var newDateAsMoment = this.createStartDay(dateAsMoment);
                if (newDateAsMoment.format(this.dateFormat) > dateAsMoment.format(this.dateFormat))
                {
                    newDateAsMoment.subtract("weeks", 1);
                }
                dateAsMoment = newDateAsMoment;
                //dateAsMoment = weekStartDay > dateAsMoment ? weekStartDay.subtract("weeks", 1) : weekStartDay;
            }

            if (dateAsMoment.unix() >= this.startDate.unix() && dateAsMoment.unix() <= this.endDate.unix())
            {
                // The requested date is within the currently rendered weeks.
                // Let's scroll straight to it.
                calendarView.scrollToDate(dateAsMoment);
                return;
            }
            else if(dateAsMoment.diff(this.endDate, "weeks") >= 8 || dateAsMoment.diff(this.startDate, "weeks") <= -8)
            {
                // The requested date is too far outside the currently rendered weeks.
                // Fade out the calendar, rerender centered on the requested date, and fade in.
                var newStartDate = this.createStartDay(dateAsMoment).subtract("weeks", 4);
                var newEndDate = this.createEndDay(dateAsMoment).add("weeks", 6);
                this.reset(newStartDate, newEndDate);
            } else if(dateAsMoment < this.startDate)
            {
                var weeksToPrepend = this.startDate.diff(dateAsMoment, "weeks") + 2;
                for(i = 0;i<weeksToPrepend;i++)
                {
                    this.prependWeekToCalendar();
                }
                calendarView.scrollToDate(dateAsMoment);
            } else if(dateAsMoment > this.endDate)
            {
                var weeksToAppend = dateAsMoment.diff(this.endDate, "weeks") + 2;
                for (i = 0; i < weeksToAppend; i++)
                {
                    this.appendWeekToCalendar();
                }
                calendarView.scrollToDate(dateAsMoment);
            }

            setImmediate(function()
            {
                calendarView.scrollToDate(dateAsMoment);
            });

        },

        initializeHeader: function ()
        {
            if (this.views.header)
                this.views.header.close();

            this.models.calendarHeaderModel = new TP.Model();

            this.views.header = new CalendarHeaderView({ model: this.models.calendarHeaderModel });

            this.views.header.on("request:today", this.onRequestToday, this);
            this.views.header.on("request:nextweek", this.onRequestNextWeek, this);
            this.views.header.on("request:lastweek", this.onRequestLastWeek, this);
        },

        initializeCalendar: function()
        {
            var weekDaysModel = new TP.Model({ startOfWeekDayIndex: this.startOfWeekDayIndex });
            
            if (this.views.calendar)
                this.views.calendar.close();

            this.views.calendar = new CalendarContainerView({ model: weekDaysModel, collection: this.weeksCollection, calendarHeaderModel: this.models.calendarHeaderModel });

            this.bindToCalendarViewEvents(this.views.calendar);
        },

        onRequestToday: function()
        {
            this.showDate(moment());
        },
        
        onRequestLastWeek: function(currentWeekModel)
        {
            // header has end of week, our showDate wants start of week ...
            this.showDate(moment(currentWeekModel.get("date")).subtract("days",6).subtract("weeks", 1), 200);
        },
        
        onRequestNextWeek: function(currentWeekModel)
        {
            // header has end of week, our showDate wants start of week ...
            this.showDate(moment(currentWeekModel.get("date")).add("days", 1), 200);
        },

        bindToCalendarViewEvents: function (calendarView)
        {
            calendarView.on("prepend", this.prependWeekToCalendar, this);
            calendarView.on("append", this.appendWeekToCalendar, this);
            calendarView.on("itemDropped", this.onDropItem, this);
        },

        onDropItem: function(options)
        {
            if (options.DropEvent === "itemMoved")
            {
                this.weeksCollection.onItemMoved(options);        
            }
            else if (options.DropEvent === "addExerciseFromLibrary")
            {
                var workout = this.createNewWorkoutFromExerciseLibraryItem(options.ItemId, options.destinationCalendarDayModel.id);
                this.weeksCollection.addWorkout(workout);
                workout.save();
            }
        },

        createNewWorkoutFromExerciseLibraryItem: function(exerciseLibraryItemId, workoutDate)
        {
            var exerciseLibraryItem = this.libraryCollections.exerciseLibrary.get(exerciseLibraryItemId);
            return new WorkoutModel({
                personId: theMarsApp.user.get("userId"),
                workoutDay: workoutDate,
                title: exerciseLibraryItem.get("itemName"),
                workoutTypeValueId: exerciseLibraryItem.get("workoutTypeId")
            });
        },

        initializeLibrary: function()
        {
            this.libraryCollections = {
                exerciseLibrary: new LibraryExercisesCollection()
            };

            if (this.views.library)
                this.views.library.close();

            this.views.library = new LibraryView({ collections: this.libraryCollections });

        },

        appendWeekToCalendar: function ()
        {
            var startDate = moment(this.endDate).add("days", 1);
            var endDate = moment(startDate).add("days", 6);
            this.endDate = moment(endDate);

            this.weeksCollection.appendWeek(startDate);
            this.weeksCollection.requestWorkouts(startDate, endDate);
        },

        prependWeekToCalendar: function()
        {
            var endDate = moment(this.startDate).subtract("days", 1);
            var startDate = moment(endDate).subtract("days", 6);
            this.startDate = moment(startDate);

            this.weeksCollection.prependWeek(startDate);
            this.weeksCollection.requestWorkouts(startDate, endDate);
        }
    });
});