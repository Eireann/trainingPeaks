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
"views/calendarView",
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

                var expectedStartDate = moment().day(0).subtract("weeks", 4);
                expect(controller.startDate.format("YYYY-MM-DD")).toBe(expectedStartDate.format("YYYY-MM-DD"));
            });

            it("Should have an endDate set to the end of the week six weeks from now", function()
            {
                var controller = new CalendarController();
                expect(controller.endDate).toBeDefined();

                var expectedEndDate = moment().day(6).add("weeks", 6);
                expect(controller.endDate.format("YYYY-MM-DD")).toBe(expectedEndDate.format("YYYY-MM-DD"));
            });

            it("Should have a weeksCollection", function()
            {
                var controller = new CalendarController();
                expect(controller.weeksCollection).toBeDefined();
                expect(controller.weeksCollection).not.toBeNull();
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

        describe("Bind to CalendarView events", function()
        {

            var context = {
                prependWeekToCalendar: function() { },
                appendWeekToCalendar: function() { },
                onItemDropped: function() { }
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
                expect(calendarView.on).toHaveBeenCalledWith("itemDropped", context.onItemDropped, context);
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

            it("Should bind to LibraryView events", function()
            {
                var controller = new CalendarController();
                spyOn(controller, "bindToLibraryViewEvents");
                controller.initializeLibrary();
                expect(controller.bindToLibraryViewEvents).toHaveBeenCalledWith(controller.views.library);
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

    });

});
