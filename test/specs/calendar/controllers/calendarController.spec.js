// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
"moment",
"jquery",
"underscore",
"backbone",
"controllers/calendarController",
"models/workoutModel",
"models/workoutsCollection",
"views/calendarContainerView",
"views/library/libraryView"
],
function(moment, $, _, Backbone, CalendarController, WorkoutModel, WorkoutsCollection, CalendarView, LibraryView)
{

    describe("Calendar Controller", function()
    {
        beforeEach(function()
        {
            // let's not make any remote server calls, just testing object interactions here
            spyOn($, "ajax").andCallFake(function()
            {
                return $.Deferred();
            });
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
                var controller = new CalendarController();
                expect(controller.getLayout()).toBeDefined();
            });

            it("Should have a startDate set to the beginning of the week 4 weeks ago", function()
            {
                var controller = new CalendarController();
                expect(controller.startDate).toBeDefined();

                var expectedStartDate = moment().day(controller.startOfWeekDayIndex).subtract("weeks", 4);
                expect(controller.startDate.format("YYYY-MM-DD")).toBe(expectedStartDate.format("YYYY-MM-DD"));
            });

            it("Should have an endDate set to the end of the week six weeks from now", function()
            {
                var controller = new CalendarController();
                expect(controller.endDate).toBeDefined();

                var expectedEndDate = moment().day(6 + controller.startOfWeekDayIndex).add("weeks", 6);
                expect(controller.endDate.format("YYYY-MM-DD")).toBe(expectedEndDate.format("YYYY-MM-DD"));
            });

            it("Should have a weeksCollection", function()
            {
                var controller = new CalendarController();
                expect(controller.weeksCollection).toBeDefined();
                expect(controller.weeksCollection).not.toBeNull();
            });
        });

        describe("Show calendar", function()
        {
            var controller;

            beforeEach(function()
            {
                controller = new CalendarController();
                spyOn(controller, "showViewsInRegions");
                spyOn(controller, "scrollToDateAfterLoad");
                spyOn(controller, "showDate");
            });

            it("Should initialize the header", function()
            {
                spyOn(controller, "initializeHeader");
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

            it("Should display the views in their regioins", function()
            {
                controller.show();
                expect(controller.showViewsInRegions).toHaveBeenCalled();
            });

            it("Should load the library data", function()
            {
                spyOn(controller, "loadLibraryData");
                controller.show();
                expect(controller.loadLibraryData).toHaveBeenCalled();
            });

            it("Should load the calendar data", function()
            {
                spyOn(controller, "loadCalendarData");
                controller.show();
                expect(controller.loadCalendarData).toHaveBeenCalled();
            });

            it("Should scroll to today after loading", function()
            {
                controller.show();
                expect(controller.scrollToDateAfterLoad).toHaveBeenCalled();
            });

        });

        describe("initializeCalendar", function()
        {
            it("Should create a CalendarView", function()
            {
                var controller = new CalendarController();
                spyOn(CalendarView.prototype, "initialize").andCallThrough();
                controller.initializeCalendar();
                expect(CalendarView.prototype.initialize).toHaveBeenCalled();
            });

            it("Should bind to CalendarView events", function()
            {
                var controller = new CalendarController();
                spyOn(controller, "bindToCalendarViewEvents");
                controller.initializeCalendar();
                expect(controller.bindToCalendarViewEvents).toHaveBeenCalledWith(controller.views.calendar);
            });

        });

        describe("Load calendar data", function()
        {

            it("Should call requestWorkouts once for each week", function()
            {
                var controller = new CalendarController();
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
                it("Should create an exerciseLibrary", function()
                {
                    var controller = new CalendarController();
                    controller.initializeLibrary();
                    expect(controller.libraryCollections.exerciseLibrary).toBeDefined();
                });
                
            });

            it("Should fetch the exercise library", function()
            {
                var controller = new CalendarController();
                controller.initializeLibrary();
                spyOn(controller.libraryCollections.exerciseLibrary, "fetch");
                controller.loadLibraryData();
                expect(controller.libraryCollections.exerciseLibrary.fetch).toHaveBeenCalled();
            });
        });

        describe("Bind to CalendarView events", function()
        {

            var context = {
                prependWeekToCalendar: function() { },
                appendWeekToCalendar: function() { },
                onDropItem: function() { }
            };

                        
            var calendarView;

            beforeEach(function() {
                calendarView = jasmine.createSpyObj("CalendarView spy", ["on"]);
            });

            it("Should bind to calendar view 'prepend' event", function()
            {
                CalendarController.prototype.bindToCalendarViewEvents.call(context, calendarView);
                expect(calendarView.on).toHaveBeenCalledWith("prepend", context.prependWeekToCalendar, context);
            });

            it("Should bind to calendar view 'append' event", function()
            {
                CalendarController.prototype.bindToCalendarViewEvents.call(context, calendarView);
                expect(calendarView.on).toHaveBeenCalledWith("append", context.appendWeekToCalendar, context);
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
                var controller = new CalendarController();
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
                var controller = new CalendarController();
                spyOn(controller.weeksCollection, "onItemMoved");
                controller.onDropItem(eventOptions);
                expect(controller.weeksCollection.onItemMoved).toHaveBeenCalledWith(eventOptions);
            });

            it("Should drag a new workout from library", function()
            {
                var eventOptions = {
                    DropEvent: "addExerciseFromLibrary",
                    ItemId: 5432,
                    destinationCalendarDayModel: {
                        id: '2012-01-01'
                    }
                };
                var controller = new CalendarController();
                controller.initializeCalendar();
                spyOn(controller.views.calendar, "scrollToDate");
                var workout = jasmine.createSpyObj("Workout spy", ["save"]);
                spyOn(controller.weeksCollection, "addWorkout");
                spyOn(controller, "createNewWorkoutFromExerciseLibraryItem").andReturn(workout);
                controller.onDropItem(eventOptions);
                expect(controller.createNewWorkoutFromExerciseLibraryItem).toHaveBeenCalledWith(eventOptions.ItemId, eventOptions.destinationCalendarDayModel.id);
                expect(controller.weeksCollection.addWorkout).toHaveBeenCalledWith(workout);
                expect(workout.save).toHaveBeenCalled();
            });
        });

        describe("Prepend a week to the calendar", function()
        {

            var controller;
            var expectedStartDate;
            var expectedEndDate;
            var dateFormat = "YYYY-MM-DD";

            beforeEach(function()
            {
                controller = new CalendarController();
                expectedEndDate = moment(controller.startDate).subtract("days", 1);
                expectedStartDate = moment(expectedEndDate).subtract("days", 6);
            });

            it("Should request workouts with the appropriate dates", function()
            {
                spyOn(controller.weeksCollection, "requestWorkouts");
                controller.prependWeekToCalendar();
                expect(controller.weeksCollection.requestWorkouts).toHaveBeenCalled();
                var lastCall = controller.weeksCollection.requestWorkouts.mostRecentCall;
                expect(lastCall.args[0].format(dateFormat)).toEqual(expectedStartDate.format(dateFormat));
                expect(lastCall.args[1].format(dateFormat)).toEqual(expectedEndDate.format(dateFormat));
            });

            it("Should call collection.prependWeek", function()
            {
                spyOn(controller.weeksCollection, "prependWeek");
                controller.prependWeekToCalendar();
                expect(controller.weeksCollection.prependWeek).toHaveBeenCalled();
                var lastCall = controller.weeksCollection.prependWeek.mostRecentCall;
                expect(lastCall.args[0].format(dateFormat)).toEqual(expectedStartDate.format(dateFormat));
            });

        });

        describe("Append a week to the calendar", function()
        {

            var controller;
            var expectedStartDate;
            var expectedEndDate;
            var dateFormat = "YYYY-MM-DD";

            beforeEach(function()
            {
                controller = new CalendarController();
                expectedStartDate = moment(controller.endDate).add("days", 1);
                expectedEndDate = moment(expectedStartDate).add("days", 6);
            });

            it("Should request workouts with the appropriate dates", function()
            {
                spyOn(controller.weeksCollection, "requestWorkouts");
                controller.appendWeekToCalendar();
                expect(controller.weeksCollection.requestWorkouts).toHaveBeenCalled();
                var lastCall = controller.weeksCollection.requestWorkouts.mostRecentCall;
                expect(lastCall.args[0].format(dateFormat)).toEqual(expectedStartDate.format(dateFormat));
                expect(lastCall.args[1].format(dateFormat)).toEqual(expectedEndDate.format(dateFormat));
            });

            it("Should call collection.appendWeek", function()
            {
                spyOn(controller.weeksCollection, "appendWeek");
                controller.appendWeekToCalendar();
                expect(controller.weeksCollection.appendWeek).toHaveBeenCalled();
                var lastCall = controller.weeksCollection.appendWeek.mostRecentCall;
                expect(lastCall.args[0].format(dateFormat)).toEqual(expectedStartDate.format(dateFormat));
            });
        });


        describe("Reset", function()
        {

            var controller, endDate, startDate;

            beforeEach(function()
            {
                startDate = moment().day(0);
                endDate = moment().day(0).add("weeks",4);
                controller = new CalendarController();
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
                controller = new CalendarController();
                spyOn(controller, "reset");
                spyOn(controller, "prependWeekToCalendar");
                spyOn(controller, "appendWeekToCalendar");
                controller.initializeCalendar();
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
                expect(controller.reset).toHaveBeenCalled();
            });

            it("Should prepend week if date is before current range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).subtract("weeks", 5);
                controller.showDate(showDate);
                expect(controller.reset).not.toHaveBeenCalled();
                expect(controller.prependWeekToCalendar).toHaveBeenCalled();
            });

            it("Should append week if date is before current range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).add("weeks", 6);
                controller.showDate(showDate);
                expect(controller.reset).not.toHaveBeenCalled();
                expect(controller.appendWeekToCalendar).toHaveBeenCalled();
            });
        });

    });

});
