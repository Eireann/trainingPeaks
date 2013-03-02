define(
[
    "underscore",
    "moment",
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
function (_, moment, TP, CalendarLayout, CalendarCollection, CalendarWeekCollection,
         CalendarDayModel, LibraryExercisesCollection, WorkoutModel, CalendarHeaderView, CalendarContainerView, LibraryView)
{
    return TP.Controller.extend(
    {
        summaryViewEnabled: true,

        show: function()
        {
            theMarsApp.logger.startTimer("CalendarController", "begin show");
            this.initializeHeader();
            this.initializeCalendar();
            this.initializeLibrary();

            this.layout.headerRegion.show(this.views.header);
            this.layout.calendarRegion.show(this.views.calendar);
            this.layout.libraryRegion.show(this.views.library);

            this.loadCalendarData();
            this.loadLibraryData();

            theMarsApp.logger.logTimer("CalendarController", "finished show");
        },

        loadCalendarData: function()
        {
            theMarsApp.logger.startTimer("CalendarController", "begin request calendar data");
            // don't make requests until after we display, or else localStorage cache synchronous read blocks browser rendering
            var diff = this.endDate.diff(this.startDate, "weeks");
            for (var i = 0; i < diff; i++)
            {
                var startDate = moment(this.startDate).add("weeks", i);
                var endDate = moment(startDate).add("days", 6);
                this.weeksCollection.requestWorkouts(startDate, endDate);
            }
            theMarsApp.logger.logTimer("CalendarController", "finished request calendar data");
        },

        loadLibraryData: function()
        {
            for (var libraryName in this.libraryCollections)
                this.libraryCollections[libraryName].fetch();
        },

        initialize: function()
        {
            this.models = {};
            this.views = {};

            this.startOfWeekDayIndex = 1;
            
            this.layout = new CalendarLayout();
            this.layout.on("show", this.show, this);

            this.dateFormat = "YYYY-MM-DD";

            this.startDate = moment().day(this.startOfWeekDayIndex).subtract("weeks", 4);
            this.endDate = moment().day(6 + this.startOfWeekDayIndex).add("weeks", 6);

            this.weeksCollection = new CalendarCollection(null,
            {
                summaryViewEnabled: this.summaryViewEnabled,
                startDate: moment(this.startDate),
                endDate: moment(this.endDate)
            });
        },
        
        reset: function(startDate, endDate)
        {
            this.views.calendar.$el.fadeOut({ duration: 800 });
            this.startDate = moment(startDate);
            this.endDate = moment(endDate);
            this.weeksCollection.resetToDates(moment(this.startDate), moment(this.endDate));
            this.loadCalendarData();
            this.views.calendar.$el.fadeIn({ duration: 800 });
        },

        showDate: function(dateAsMoment)
        {
            if (!dateAsMoment)
                return;
            
            if (dateAsMoment.unix() >= this.startDate.unix() && dateAsMoment.unix() <= this.endDate.unix())
            {
                // The requested date is within the currently rendered weeks.
                // Let's scroll straight to it.

                this.views.calendar.scrollToDate(dateAsMoment);
            }
            else if(dateAsMoment.diff(this.endDate, "weeks") >= 8 || dateAsMoment.diff(this.startDate, "weeks") <= -8)
            {
                // The requested date is too far outside the currently rendered weeks.
                // Fade out the calendar, rerender centered on the requested date, and fade in.

                var newStartDate = moment(dateAsMoment).day(this.startOfWeekDayIndex).subtract("weeks", 4);
                var newEndDate = moment(dateAsMoment).day().add("weeks", 6);
                this.reset(newStartDate, newEndDate);
                this.views.calendar.scrollToDate(dateAsMoment);
            }
        },

        initializeHeader: function ()
        {
            if (this.views.header)
                this.views.header.close();

            this.models.calendarHeaderModel = new TP.Model();
            this.views.header = new CalendarHeaderView({ model: this.models.calendarHeaderModel });
            var self = this;
            this.views.header.on("request:today", function()
            {
                self.showDate(moment());
            });
        },

        initializeCalendar: function()
        {
            var weekDaysModel = new TP.Model({ startOfWeekDayIndex: this.startOfWeekDayIndex });
            
            if (this.views.calendar)
                this.views.calendar.close();
            
            this.views.calendar = new CalendarContainerView({ model: weekDaysModel, collection: this.weeksCollection, calendarHeaderModel: this.models.calendarHeaderModel });

            this.bindToCalendarViewEvents(this.views.calendar);
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