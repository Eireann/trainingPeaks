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
    "views/calendarView",
    "views/library/libraryView"
    ],
function(_, moment, TP, CalendarLayout, CalendarCollection, CalendarWeekCollection,
    CalendarDayModel, LibraryExercisesCollection, WorkoutModel, CalendarView, LibraryView)
{
    return TP.Controller.extend(
    {
        startOfWeekDayIndex: 0,
        summaryViewEnabled: true,

        show: function()
        {
            this.initializeCalendar();
            this.initializeLibrary();
            this.weeksCollection.requestWorkouts(this.startDate, this.endDate);
            this.layout.calendarRegion.show(this.views.calendar);
            this.layout.libraryRegion.show(this.views.library);
        },

        initialize: function ()
        {
            this.views = {};
            
            this.layout = new CalendarLayout();
            this.layout.on("show", this.show, this);

            this.dateFormat = "YYYY-MM-DD";

            // start on a Sunday
            this.startDate = moment().day(this.startOfWeekDayIndex).subtract("weeks", 4);

            // end on a Saturday
            this.endDate = moment().day(6 + this.startOfWeekDayIndex).add("weeks", 6);

            this.weeksCollection = new CalendarCollection(null, { startDate: moment(this.startDate), endDate: moment(this.endDate), startOfWeekDayIndex: this.startOfWeekDayIndex, summaryViewEnabled: this.summaryViewEnabled });
        },

        initializeCalendar: function()
        {
            var weekDaysModel = new TP.Model({ weekDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] });

            if (this.views.calendar)
                this.views.calendar.close();
            
            this.views.calendar = new CalendarView({ model: weekDaysModel, collection: this.weeksCollection });

            this.bindToCalendarViewEvents(this.views.calendar);

        },

        bindToCalendarViewEvents: function(calendarView) {
            calendarView.on("prepend", this.prependWeekToCalendar, this);
            calendarView.on("append", this.appendWeekToCalendar, this);
            calendarView.on("itemDropped", this.onDropItem, this);
        },

        onDropItem: function(options)
        {
            if (options.DropEvent === "itemMoved")
            {
                this.weeksCollection.onItemMoved(options);        
            } else if (options.DropEvent === "addExerciseFromLibrary")
            {
                var workout = this.createNewWorkoutFromExerciseLibraryItem(options.ItemId);
                this.weeksCollection.addWorkout(workout);
                workout.save();
            }
        },

        createNewWorkoutFromExerciseLibraryItem: function(exerciseLibraryItemId)
        {
            var exerciseLibraryItem = this.libraryCollections.exerciseLibrary.get(exerciseLibraryItemId);
            return new WorkoutModel({
                PersonId: theMarsApp.user.get("personId"),
                WorkoutDay: options.destinationCalendarDayModel.id,
                Title: exerciseLibraryItem.get("ItemName"),
                WorkoutTypeValueId: exerciseLibraryItem.get("WorkoutTypeId")
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

            var controller = this;
            _.each(_.keys(this.libraryCollections), function(libraryName)
            {
                controller.libraryCollections[libraryName].fetch();
            });
        },


        appendWeekToCalendar: function ()
        {
            var startDate = moment(this.endDate).add("days", 1);
            var endDate = moment(startDate).add("days", 6);
            this.endDate = moment(endDate);

            this.weeksCollection.requestWorkouts(startDate, endDate);
            this.weeksCollection.appendWeek(startDate);
        },

        prependWeekToCalendar: function()
        {
            var endDate = moment(this.startDate).subtract("days", 1);
            var startDate = moment(endDate).subtract("days", 6);
            this.startDate = moment(startDate);

            this.weeksCollection.requestWorkouts(startDate, endDate);
            this.weeksCollection.prependWeek(startDate);
        }
    });
});