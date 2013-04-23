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
    "models/library/exerciseLibrariesCollection",
    "models/library/libraryExercisesCollection",
    "models/workoutModel",
    "models/commands/addWorkoutFromExerciseLibrary",
    "views/calendar/calendarHeaderView",
    "views/calendar/calendarContainerView",
    "views/library/libraryView"
],
function(_, moment, setImmediate, TP, CalendarLayout, CalendarCollection, CalendarWeekCollection,
         CalendarDayModel, ExerciseLibrariesCollection, LibraryExercisesCollection, WorkoutModel, AddWorkoutFromExerciseLibrary,
         calendarHeaderView, CalendarContainerView, LibraryView)
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
            var today = moment();
            this.showDate(today);
            var self = this;
            var onLoad = function(deferreds)
            {
                self.scrollToDateAfterLoad(deferreds, today);
            };
            this.loadCalendarData(onLoad);

            this.loadLibraryData();

            this.watchClipboard();
        }, 

        showViewsInRegions: function()
        {
            this.layout.headerRegion.show(this.views.header);
            this.layout.calendarRegion.show(this.views.calendar);
            this.layout.libraryRegion.show(this.views.library);
        },

        scrollToDateAfterLoad: function(deferreds, dateToScrollTo, each)
        {
            var ajaxCachingDeferreds = [];
            _.each(deferreds, function(deferred)
            {
                if (deferred.hasOwnProperty("ajaxCachingDeferred"))
                {
                    ajaxCachingDeferreds.push(deferred.ajaxCachingDeferred);
                }
            });

            var calendarController = this;
            // check after each week loads
            if (each)
            {
                var scrollItEachTime = function()
                {
                    setImmediate(function() { calendarController.showDate(moment(dateToScrollTo), 10); });
                };
                _.each(ajaxCachingDeferreds, function(deferred)
                {
                    deferred.done(scrollItEachTime);
                });
                _.each(deferreds, function(deferred)
                {
                    deferred.done(scrollItEachTime);
                });

                // check after they all load
            } else
            {
                // once all of the data has loaded, set a timeout to allow repainting, then scroll to today
                calendarController.wasScrolled = false;
                var scrollItOnce = function()
                {
                    if (!calendarController.wasScrolled)
                    {
                        calendarController.wasScrolled = true;
                        setTimeout(function() { calendarController.showDate(moment(dateToScrollTo), 500); }, 100);
                    }
                };
                if (ajaxCachingDeferreds.length > 0)
                {
                    $.when.apply($, ajaxCachingDeferreds).then(scrollItOnce);
                }

                $.when.apply($, deferreds).then(scrollItOnce);
            }


        },

        loadCalendarData: function(callback)
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
            if (callback)
                callback(deferreds);

            return deferreds;
        },

        loadLibraryData: function()
        {
            for (var libraryName in this.libraryCollections)
                this.libraryCollections[libraryName].fetch();
        },

        watchClipboard: function()
        {
            this.weeksCollection.on("paste:enable", this.onPasteEnabled, this);
            this.weeksCollection.on("paste:disable", this.onPasteDisabled, this);
            this.onPasteDisabled();
        },

        onPasteEnabled: function()
        {
            $('body').removeClass('pasteDisabled').addClass('pasteEnabled');
        },

        onPasteDisabled: function()
        {
            $('body').removeClass('pasteEnabled').addClass('pasteDisabled');
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

            this.startDate = this.createStartDay().subtract("weeks", 4);
            this.endDate = this.createEndDay().add("weeks", 6);

            this.weeksCollection = new CalendarCollection(null,
            {
                summaryViewEnabled: this.summaryViewEnabled,
                startDate: moment(this.startDate),
                endDate: moment(this.endDate)
            });
        },

        reset: function(startDate, endDate, scrollToDate)
        {
            this.views.calendar.fadeOut(800);
            this.startDate = moment(startDate);
            this.endDate = moment(endDate);
            this.weeksCollection.resetToDates(moment(this.startDate), moment(this.endDate));

            if (scrollToDate)
            {
                var self = this;
                var onLoad = function(deferreds)
                {
                    return self.scrollToDateAfterLoad(deferreds, scrollToDate);
                };
                this.loadCalendarData(onLoad);
            }
            else
                this.loadCalendarData();

            this.views.calendar.fadeIn(800);
        },

        clearCacheAndRefresh: function()
        {
            theMarsApp.ajaxCaching.clearCache();
            this.weeksCollection.resetToDates(moment(this.startDate), moment(this.endDate));
            this.views.calendar.scrollToLastViewedDate();
            var headerDate = this.views.calendar.getHeaderDate();
            var self = this;
            var onLoad = function(deferreds)
            {
                return self.scrollToDateAfterLoad(deferreds, headerDate);
            };
            this.loadCalendarData(onLoad);
        },

        showDate: function(dateAsMoment, effectDuration)
        {
            if (!dateAsMoment)
                return;

            if (!moment.isMoment(dateAsMoment))
                dateAsMoment = moment(dateAsMoment);

            var calendarView = this.views.calendar;
            var i;

            if (dateAsMoment.day() !== this.startOfWeekDayIndex)
            {
                var newDateAsMoment = this.createStartDay(dateAsMoment);
                if (newDateAsMoment.format(TP.utils.datetime.shortDateFormat) > dateAsMoment.format(TP.utils.datetime.shortDateFormat))
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
                this.reset(newStartDate, newEndDate, dateAsMoment);
            }
            else if(dateAsMoment < this.startDate)
            {
                var weeksToPrepend = this.startDate.diff(dateAsMoment, "weeks") + 2;
                for(i = 0;i<weeksToPrepend;i++)
                {
                    this.prependWeekToCalendar();
                }
                calendarView.scrollToDate(dateAsMoment);
            }
            else if (dateAsMoment > this.endDate)
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

            this.views.header = new calendarHeaderView({ model: this.models.calendarHeaderModel });

            this.views.header.on("request:today", this.onRequestToday, this);
            this.views.header.on("request:nextweek", this.onRequestNextWeek, this);
            this.views.header.on("request:lastweek", this.onRequestLastWeek, this);
            this.views.header.on("request:refresh", this.onRequestRefresh, this);
        },

        initializeCalendar: function()
        {
            var weekDaysModel = new TP.Model({ startOfWeekDayIndex: this.startOfWeekDayIndex });
            
            if (this.views.calendar)
                this.views.calendar.close();

            this.views.calendar = new CalendarContainerView({
                model: weekDaysModel, collection: this.weeksCollection,
                calendarHeaderModel: this.models.calendarHeaderModel,
                startOfWeekDayIndex: this.startOfWeekDayIndex
            });

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

        onRequestRefresh: function(currentWeekModel)
        {
            var dateAsMoment = moment(currentWeekModel.get("date"));

            if (dateAsMoment.day() !== this.startOfWeekDayIndex)
            {
                var newDateAsMoment = this.createStartDay(dateAsMoment);
                if (newDateAsMoment.format(TP.utils.datetime.shortDateFormat) > dateAsMoment.format(TP.utils.datetime.shortDateFormat))
                {
                    newDateAsMoment.subtract("weeks", 1);
                }
                dateAsMoment = newDateAsMoment;
            }
            
            var newStartDate = this.createStartDay(dateAsMoment).subtract("weeks", 4);
            var newEndDate = this.createEndDay(dateAsMoment).add("weeks", 6);

            this.reset(newStartDate, newEndDate, dateAsMoment);

            var calendarView = this.views.calendar;
            setImmediate(function ()
            {
                calendarView.scrollToDate(dateAsMoment);
            });
        },

        bindToCalendarViewEvents: function(calendarView)
        {
            calendarView.on("prepend", this.prependWeekToCalendar, this);
            calendarView.on("append", this.appendWeekToCalendar, this);
            calendarView.on("itemDropped", this.onDropItem, this);
            calendarView.on("workoutsShifted", this.onShiftItems, this);
            calendarView.on("itemMoved", this.onItemMoved, this);
        },

        onDropItem: function(options)
        {
            if (options.DropEvent === "itemMoved")
            {
                this.weeksCollection.onItemMoved(options);        
            }
            else if (options.DropEvent === "dayMoved")
            {
                this.weeksCollection.onDayMoved(options);
            }
            else if (options.DropEvent === "addExerciseFromLibrary")
            {
                var destinationDate = options.destinationCalendarDayModel.id;

                // create a model by copying library attributes
                var workout = this.createNewWorkoutFromExerciseLibraryItem(options.LibraryId, options.ItemId, destinationDate);

                // add it to the calendar
                this.weeksCollection.addWorkout(workout);
                this.views.calendar.scrollToDate(destinationDate);
                
            } 
        },

        onShiftItems: function(shiftCommand)
        {
            this.clearCacheAndRefresh();
        },

        createNewWorkoutFromExerciseLibraryItem: function(exerciseLibraryId, exerciseLibraryItemId, workoutDate)
        {
            var exerciseLibraryItem = this.libraryCollections.exerciseLibraries.get(exerciseLibraryId).exercises.get(exerciseLibraryItemId);
            var workout = new WorkoutModel({
                athleteId: theMarsApp.user.get("athletes.0.athleteId"),
                workoutDay: workoutDate,
                title: exerciseLibraryItem.get("itemName"),
                workoutTypeValueId: exerciseLibraryItem.get("workoutTypeId")
            });

            // then update it with the full workout attributes from library
            var addFromLibraryCommand = new AddWorkoutFromExerciseLibrary({}, { workout: workout, exerciseLibraryItem: exerciseLibraryItem });
            addFromLibraryCommand.execute();

            return workout;
        },

        initializeLibrary: function()
        {
            this.libraryCollections = {
                exerciseLibraries: new ExerciseLibrariesCollection()
            };

            if (this.views.library)
                this.views.library.close();

            this.views.library = new LibraryView({ collections: this.libraryCollections });
            this.views.library.on("animate", this.onLibraryAnimate, this);
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
        },

        onLibraryAnimate: function(cssAttributes, duration)
        {
            this.views.calendar.onLibraryAnimate(cssAttributes, duration);
        },

        onItemMoved: function(item, movedToDate, deferredResult)
        {
            var self = this;
            var callback = function()
            {
                self.showDate(movedToDate);
            };
            deferredResult.done(callback);
        },

        getExerciseLibraries: function()
        {
            return this.libraryCollections.exerciseLibraries;
        }

    });
});