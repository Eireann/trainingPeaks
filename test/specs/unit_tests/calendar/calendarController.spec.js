// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "TP",
    "app",
    "moment",
    "jquery",
    "underscore",
    "backbone",
    "framework/dataManager",
    "controllers/calendar/calendarController",
    "models/workoutModel",
    "models/workoutsCollection",
    "models/library/trainingPlan",
    "views/calendar/container/calendarContainerView",
    "views/calendar/library/libraryView"
],
function(
    TP,
    theMarsApp,
    moment,
    $,
    _,
    Backbone,
    DataManager,
    CalendarController,
    WorkoutModel,
    WorkoutsCollection,
    TrainingPlan,
    CalendarView,
    LibraryView
    )
{

    describe("Calendar Controller", function()
    {

        beforeEach(function()
        {
            theMarsApp.user.setCurrentAthleteId(1234, true);
        });

        afterEach(function()
        {
            theMarsApp.user.setCurrentAthleteId(null, true);
        });

        it("Should load successfully as a module", function()
        {
            expect(CalendarController).toBeDefined();
        });

        describe("Initialize controller", function()
        {
            it("Should have a getLayout method", function()
            {
                expect(typeof CalendarController.prototype.getLayout).toBe("function");
            });
            
            it("Should have a layout", function()
            {
                var controller = new CalendarController({ dataManager: new DataManager() });
                expect(controller.getLayout()).toBeDefined();
            });

            it("Should have a startDate set to the beginning of the week 4 weeks ago", function()
            {
                var controller = new CalendarController({ dataManager: new DataManager() });
                expect(controller.startDate).toBeDefined();

                var expectedStartDate = moment().day(controller.startOfWeekDayIndex).subtract("weeks", 4);
                expect(controller.startDate.format("YYYY-MM-DD")).toBe(expectedStartDate.format("YYYY-MM-DD"));
            });

            it("Should have an endDate set to the end of the week six weeks from now", function()
            {
                var controller = new CalendarController({ dataManager: new DataManager() });
                expect(controller.endDate).toBeDefined();

                var expectedEndDate = moment().day(6 + controller.startOfWeekDayIndex).add("weeks", 6);
                expect(controller.endDate.format("YYYY-MM-DD")).toBe(expectedEndDate.format("YYYY-MM-DD"));
            });

            it("Should have a weeksCollection", function()
            {
                var controller = new CalendarController({ dataManager: new DataManager() });
                expect(controller.weeksCollection).toBeDefined();
                expect(controller.weeksCollection).not.toBeNull();
            });
        });

        describe("Show calendar", function()
        {
            var controller;

            beforeEach(function()
            {
                controller = new CalendarController({ dataManager: new DataManager() });
                spyOn(controller, "showViewsInRegions");
                spyOn(controller, "showDate");
            });

            it("Should initialize the header", function()
            {
                spyOn(controller, "initializeHeader").andCallThrough();
                controller.show();
                expect(controller.initializeHeader).toHaveBeenCalled();
            });

            it("Should initialize the calendar", function()
            {
                spyOn(controller, "initializeCalendar");
                controller.show();
                expect(controller.initializeCalendar).toHaveBeenCalled();
            });

            it("Should initialize the library", function()
            {
                spyOn(controller, "initializeLibrary");
                controller.show();
                expect(controller.initializeLibrary).toHaveBeenCalled();
            });

            it("Should display the views in their regions", function()
            {
                controller.show();
                expect(controller.showViewsInRegions).toHaveBeenCalled();
            });

            it("Should load the library data after user loads", function()
            {
                spyOn(controller, "loadLibraryData");
                controller.show();
                theMarsApp.userFetchPromise.resolve();
                expect(controller.loadLibraryData).toHaveBeenCalled();
            });

            it("Should load the calendar data after user loads", function()
            {
                spyOn(controller, "loadCalendarData");
                controller.show();
                theMarsApp.userFetchPromise.resolve();
                expect(controller.loadCalendarData).toHaveBeenCalled();
            });
        });

        describe("initializeCalendar", function()
        {
            it("Should create a CalendarView", function()
            {
                var controller = new CalendarController({ dataManager: new DataManager() });
                spyOn(CalendarView.prototype, "initialize").andCallThrough();
                controller.initializeHeader();
                controller.initializeCalendar();
                expect(CalendarView.prototype.initialize).toHaveBeenCalled();
            });

            it("Should bind to CalendarView events", function()
            {
                var controller = new CalendarController({ dataManager: new DataManager() });
                spyOn(controller, "bindToCalendarViewEvents");
                controller.initializeHeader();
                controller.initializeCalendar();
                expect(controller.bindToCalendarViewEvents).toHaveBeenCalledWith(controller.views.calendar);
            });

        });

        describe("Load calendar data", function()
        {

            it("Should call requestWorkouts once for each week", function()
            {
                var controller = new CalendarController({ dataManager: new DataManager() });
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 20);
                spyOn(controller.weeksCollection, "requestWorkouts");
                controller.loadCalendarData();
                expect(controller.weeksCollection.requestWorkouts).toHaveBeenCalled();
                expect(controller.weeksCollection.requestWorkouts.callCount).toEqual(20);
            });

        });

        describe("Load library data", function()
        {

            describe("Initialize library", function()
            {
                it("Should create an exerciseLibraries", function()
                {
                    var controller = new CalendarController({ dataManager: new DataManager() });
                    controller.initializeLibrary();
                    expect(controller.libraryCollections.exerciseLibraries).toBeDefined();
                });
                
            });

            it("Should fetch the exercise library", function()
            {
                var controller = new CalendarController({ dataManager: new DataManager() });
                controller.initializeLibrary();
                spyOn(controller.libraryCollections.exerciseLibraries, "fetch");
                controller.loadLibraryData();
                expect(controller.libraryCollections.exerciseLibraries.fetch).toHaveBeenCalled();
            });
        });

        describe("Bind to CalendarView events", function()
        {

            var context = {
                prependWeekToCalendar: function() { },
                appendWeekToCalendar: function() { },
                onDropItem: function() { },
                bindToDragMoveAndShiftEvents: CalendarController.prototype.bindToDragMoveAndShiftEvents
            };

                        
            var calendarView;

            beforeEach(function()
            {
                calendarView = jasmine.createSpyObj("CalendarView spy", ["on"]);
            });

            it("Should bind to calendar view 'scroll:bottom' event", function()
            {
                CalendarController.prototype.bindToCalendarViewEvents.call(context, calendarView);
                expect(calendarView.on).toHaveBeenCalledWith("scroll:bottom", context.appendWeekToCalendar, context);
            });

            it("Should bind to calendar view 'scroll:top' event", function()
            {
                CalendarController.prototype.bindToCalendarViewEvents.call(context, calendarView);
                expect(calendarView.on).toHaveBeenCalledWith("scroll:top", context.prependWeekToCalendar, context);
            });

            it("Should bind to calendar view 'itemDropped' event", function()
            {
                CalendarController.prototype.bindToCalendarViewEvents.call(context, calendarView);
                expect(calendarView.on).toHaveBeenCalledWith("itemDropped", context.onDropItem, context);
            });
        });

        describe("initializeLibrary", function()
        {
            it("Should create a LibraryView", function()
            {
                var controller = new CalendarController({ dataManager: new DataManager() });
                spyOn(LibraryView.prototype, "initialize").andCallThrough();
                controller.initializeLibrary();
                expect(LibraryView.prototype.initialize).toHaveBeenCalled();
            });

        });

        describe("Drag and drop items", function()
        {

            it("Should drag an existing workout to a new date", function()
            {
                var eventOptions = {
                    DropEvent: "itemMoved"
                };
                var controller = new CalendarController({ dataManager: new DataManager() });
                spyOn(controller.weeksCollection, "onItemMoved");
                controller.onDropItem(eventOptions);
                expect(controller.weeksCollection.onItemMoved).toHaveBeenCalledWith(eventOptions);
            });

            it("Should drag a new workout from library", function()
            {
                var eventOptions = {
                    DropEvent: "addExerciseFromLibrary",
                    LibraryId: 1234,
                    ItemId: 5432,
                    destinationCalendarDayModel: {
                        id: '2012-01-01'
                    }
                };
                var controller = new CalendarController({ dataManager: new DataManager() });
                controller.initializeHeader();
                controller.initializeCalendar();
                spyOn(controller.views.calendar, "scrollToDateIfNotFullyVisible");
                var workout = jasmine.createSpyObj("Workout spy", ["save", "trigger"]);
                spyOn(controller.weeksCollection, "addWorkout");
                spyOn(controller, "createNewWorkoutFromExerciseLibraryItem").andReturn(workout);
                controller.onDropItem(eventOptions);
                expect(controller.createNewWorkoutFromExerciseLibraryItem).toHaveBeenCalledWith(eventOptions.LibraryId, eventOptions.ItemId, eventOptions.destinationCalendarDayModel.id);
                expect(controller.weeksCollection.addWorkout).toHaveBeenCalledWith(workout);
                expect(workout.trigger).toHaveBeenCalledWith("select", workout);
            });
        });

        describe("Reset", function()
        {

            var controller, endDate, startDate;

            beforeEach(function()
            {
                startDate = moment().day(0);
                endDate = moment().day(0).add("weeks",4);
                controller = new CalendarController({ dataManager: new DataManager() });
                controller.initializeHeader();
                controller.initializeCalendar();
                spyOn(controller.weeksCollection, "resetToDates");
            });

            it("Should set the correct start and end dates", function()
            {
                controller.reset(startDate, endDate);
                expect(controller.startDate.unix()).toEqual(startDate.unix());
                expect(controller.endDate.unix()).toEqual(endDate.unix());
            });

            it("Should reset the weeks collection to the correct dates", function()
            {
                controller.reset(startDate, endDate);
                expect(controller.weeksCollection.resetToDates).toHaveBeenCalledWith(startDate, endDate);
            });

        });

        describe("showDate", function()
        {

            var controller;
            
            beforeEach(function()
            {
                controller = new CalendarController({ dataManager: new DataManager() });
                spyOn(controller, "reset");
                controller.initializeHeader();
                controller.initializeCalendar();
                spyOn(controller.views.calendar, "scrollToDate");
                controller.views.calendar = jasmine.createSpyObj("calendar view spy", ["scrollToDate"]);
            });

            it("Should scroll to date, but not reset, if within current date range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).add("weeks", 1);
                controller.showDate(showDate);
                expect(controller.reset).not.toHaveBeenCalled();
                expect(controller.views.calendar.scrollToDate).toHaveBeenCalled();

            });

            it("Should reset if requested date is more than 8 weeks outside current range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).add("weeks", 16);
                controller.showDate(showDate);
                expect(controller.views.calendar.scrollToDate).toHaveBeenCalled();
            });

            it("Should prepend week if date is before current range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).subtract("weeks", 5);
                controller.showDate(showDate);
                expect(controller.reset).not.toHaveBeenCalled();
                expect(controller.views.calendar.scrollToDate).toHaveBeenCalled();

            });

            it("Should append week if date is before current range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).add("weeks", 6);
                controller.showDate(showDate);
                expect(controller.reset).not.toHaveBeenCalled();
                expect(controller.views.calendar.scrollToDate).toHaveBeenCalled();
            });
        });

        describe("Event binding", function()
        {
            it("Should reset the calendar state on the request:refresh event", function()
            {
                var controller = new CalendarController({ dataManager: new DataManager() });
                controller.initializeHeader();
                controller.views.calendar =
                {
                    scrollToDate: function()
                    {
                    }
                };
                
                spyOn(controller, "clearCacheAndRefresh");
                
                var dateAsMoment = moment("2013-04-16");
                var currentWeekModel = new TP.Model({ date: dateAsMoment.format(TP.utils.datetime.shortDateFormat) });

                controller.views.header.trigger("request:refresh", currentWeekModel);

                expect(controller.clearCacheAndRefresh).toHaveBeenCalled();
            });
        });

    });

});
