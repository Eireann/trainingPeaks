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
    "views/calendarContainerView",
    "views/library/libraryView",
    "hbs!templates/views/calendarHeader"
],
function(_, moment, TP, CalendarLayout, CalendarCollection, CalendarWeekCollection,
         CalendarDayModel, LibraryExercisesCollection, WorkoutModel, CalendarContainerView, LibraryView,
         calendarHeaderTemplate)
{
    return TP.Controller.extend(
    {
        startOfWeekDayIndex: 0,
        summaryViewEnabled: true,
        calendarDataLoaded: false,
        libraryDataLoaded: false,

        show: function()
        {

            theMarsApp.logger.startTimer("CalendarController", "begin show");
            this.initializeHeader();
            this.initializeCalendar();
            this.initializeLibrary();

            /*
            // this method still is effectively synchronous - read and parse local storage, then repaint
            this.views.calendar.on("show", this.loadCalendarData, this);
            this.views.library.on("show", this.loadLibraryData, this);
            */

            this.layout.headerRegion.show(this.views.header);
            this.layout.calendarRegion.show(this.views.calendar);
            this.layout.libraryRegion.show(this.views.library);

            // next tick - let the browser paint, then request our data
            var controller = this;
            setTimeout(function()
            {
                controller.loadCalendarData();
                controller.loadLibraryData();
            }, 1);

            theMarsApp.logger.logTimer("CalendarController", "finished show");
        },

        loadCalendarData: function()
        {
            if (this.calendarDataLoaded)
                return;
            theMarsApp.logger.startTimer("CalendarController", "begin request calendar data");
            // don't make requests until after we display, or else localStorage cache synchronous read blocks browser rendering
            var diff = this.endDate.diff(this.startDate, "weeks");
            for (var i = 0; i < diff; i++)
            {
                var startDate = moment(this.startDate).add("weeks", i);
                var endDate = moment(startDate).add("days", 6);
                this.weeksCollection.requestWorkouts(startDate, endDate);
            }
            this.calendarDataLoaded = true;
            theMarsApp.logger.logTimer("CalendarController", "finished request calendar data");
        },

        loadLibraryData: function()
        {
            if (this.libraryDataLoaded)
                return;

            for (var libraryName in this.libraryCollections)
            {
                this.libraryCollections[libraryName].fetch();
            }

            this.libraryDataLoaded = true;
        },

        initialize: function ()
        {
            this.models = {};
            this.views = {};
            
            this.layout = new CalendarLayout();
            this.layout.on("show", this.show, this);

            this.dateFormat = "YYYY-MM-DD";

            // start on a Sunday
            this.startDate = moment().day(this.startOfWeekDayIndex).subtract("weeks", 4);

            // end on a Saturday
            this.endDate = moment().day(6 + this.startOfWeekDayIndex).add("weeks", 6);

            // Set the currentMonthModel to be displayed in the Calendar Header (and for other use)
            this.models.currentMonthModel = new TP.Model({ month: moment().format("MMMM") });

            this.weeksCollection = new CalendarCollection(null, { startDate: moment(this.startDate), endDate: moment(this.endDate), startOfWeekDayIndex: this.startOfWeekDayIndex, summaryViewEnabled: this.summaryViewEnabled });
        },

        initializeHeader: function()
        {
            if (this.views.header)
                this.views.header.close();

            this.views.header = new Marionette.ItemView({ template: { type: "handlebars", template: calendarHeaderTemplate }, model: this.models.currentMonthModel });
        },

        initializeCalendar: function()
        {
            var weekDaysModel = new TP.Model({ startOfWeekDayIndex: this.startOfWeekDayIndex });
            
            if (this.views.calendar)
                this.views.calendar.close();
            
            this.views.calendar = new CalendarContainerView({ model: weekDaysModel, collection: this.weeksCollection });

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