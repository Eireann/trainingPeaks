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
"views/calendarView"],
function(moment, $, _, Backbone, CalendarController, WorkoutModel, WorkoutsCollection, CalendarView)
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

        xdescribe("Initialize controller", function()
        {

            it("Should have a layout", function()
            {
                var controller = new CalendarController();
                expect(controller.layout).toBeDefined();
            });

            xit("Should have a daysCollection", function()
            {
                var controller = new CalendarController();
                expect(controller.daysCollection).toBeDefined();
                expect(controller.daysCollection).not.toBeNull();
            });

            it("Should have a startDate", function()
            {
                var controller = new CalendarController();
                expect(controller.startDate).toBeDefined();
            });

            it("Should have an endDate", function()
            {
                var controller = new CalendarController();
                expect(controller.endDate).toBeDefined();
            });

            it("Should have a workoutsCollection", function()
            {
                var controller = new CalendarController();
                expect(controller.workoutsCollection).toBeDefined();
                expect(controller.workoutsCollection).not.toBeNull();
            });

            it("Should call requestWorkouts", function()
            {
                spyOn(CalendarController.prototype, "requestWorkouts").andCallThrough();
                var controller = new CalendarController();
                expect(CalendarController.prototype.requestWorkouts).toHaveBeenCalled();
            });

            it("Should call initializeCalendar", function()
            {
                spyOn(CalendarController.prototype, "initializeCalendar");
                var controller = new CalendarController();
                expect(CalendarController.prototype.initializeCalendar).toHaveBeenCalled();
            });

        });

        describe("initialize calendar", function()
        {
            it("Should create a CalendarView", function()
            {
                var controller = new CalendarController();
                spyOn(CalendarView.prototype, "initialize").andCallThrough();
                controller.initializeCalendar();
                expect(CalendarView.prototype.initialize).toHaveBeenCalled();
            });

            it("Should on to calendar view prepend", function()
            {
                var controller = new CalendarController();
                spyOn(CalendarView.__super__, "on").andCallThrough();
                controller.initializeCalendar();
                expect(CalendarView.__super__.on).toHaveBeenCalledWith("prepend", controller.prependWeekToCalendar, controller);
            });

            it("Should on to calendar view append", function()
            {
                var controller = new CalendarController();
                spyOn(CalendarView.__super__, "on").andCallThrough();
                controller.initializeCalendar();
                expect(CalendarView.__super__.on).toHaveBeenCalledWith("append", controller.appendWeekToCalendar, controller);
            });

            it("Should on to calendar view itemMoved", function()
            {
                var controller = new CalendarController();
                spyOn(CalendarView.__super__, "on").andCallThrough();
                controller.initializeCalendar();
                expect(CalendarView.__super__.on).toHaveBeenCalledWith("itemMoved", controller.onItemMoved, controller);
            });
        });

        xdescribe("Create collection of days", function()
        {

            it("Should create a collection with the right number of days", function()
            {
                var startDate = moment("2013-01-01");
                var endDate = moment("2013-01-10");
                var controller = new CalendarController();
                var days = controller.createCollectionOfDays(startDate, endDate);
                expect(days.length).toEqual(10);
            });

            it("Should add the days to daysCollection", function()
            {
                var startDate = moment("2013-01-01");
                var endDate = moment("2013-01-02");
                var controller = new CalendarController();
                var days = controller.createCollectionOfDays(startDate, endDate);
                expect(days.get('2013-01-01')).toBeDefined();
                expect(days.get('2013-01-01')).not.toBeNull();
                expect(days.get('2013-01-02')).toBeDefined();
                expect(days.get('2013-01-02')).not.toBeNull();
            });

        });

        describe("Request workouts", function()
        {

            xit("Should create a workout collection with the correct date range", function()
            {
                spyOn(WorkoutsCollection.prototype, "initialize").andCallThrough();
                var controller = new CalendarController();
                var startDate = moment("2013-01-07");
                var endDate = moment("2013-01-13");
                controller.requestWorkouts(startDate, endDate);
                expect(WorkoutsCollection.prototype.initialize).toHaveBeenCalled();
                expect(WorkoutsCollection.prototype.initialize.mostRecentCall.args[1].startDate.format()).toEqual(startDate.format());
                expect(WorkoutsCollection.prototype.initialize.mostRecentCall.args[1].endDate.format()).toEqual(endDate.format());
            });

            it("Should call CalendarController.addWorkoutToCalendarDay for each workout returned", function()
            {
                var controller = new CalendarController();

                // fake workout collection fetcher
                var workouts = [
                        new WorkoutModel({ WorkoutDay: moment().add("days", 1).format(), WorkoutId: '1234' }),
                        new WorkoutModel({ WorkoutDay: moment().add("days", 2).format(), WorkoutId: '2345' }),
                        new WorkoutModel({ WorkoutDay: moment().add("days", 3).format(), WorkoutId: '3456' })
                ];

                spyOn(WorkoutsCollection.__super__, "fetch").andCallFake(
                    function()
                    {
                        // make some workouts
                        this.models = workouts;

                        // return a deferred that immediately calls callback
                        return {
                            done: function(callback)
                            {
                                callback();
                            }
                        };
                    }
                );

                spyOn(controller, "addWorkoutToCalendarDay");
                spyOn(controller.workoutsCollection, "add");
                var startDate = moment();
                var endDate = moment().add("days", 3);
                controller.requestWorkouts(startDate, endDate);
                expect(controller.addWorkoutToCalendarDay).toHaveBeenCalled();

                _.each(workouts, function(workout)
                {
                    expect(controller.addWorkoutToCalendarDay).toHaveBeenCalledWith(workout);
                    expect(controller.workoutsCollection.add).toHaveBeenCalledWith(workout);
                });

            });

        });

        xdescribe("Add workout to calendar day", function()
        {
            it("Should add Workout model to CalendarDay model if the date matches", function()
            {
                var controller = new CalendarController();
                var todayCalendarDay = controller.daysCollection.get(moment().format("YYYY-MM-DD"));
                expect(todayCalendarDay).toBeDefined();
                expect(todayCalendarDay).not.toBeNull();
                spyOn(todayCalendarDay, "addWorkout");
                var workout = new WorkoutModel({ WorkoutDay: moment().format(), WorkoutId: "12345" });
                controller.addWorkoutToCalendarDay(workout);
                expect(todayCalendarDay.addWorkout).toHaveBeenCalledWith(workout);
            });

        });

        xdescribe("Prepend a week to the calendar", function()
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
                spyOn(controller, "requestWorkouts");
                controller.prependWeekToCalendar();
                expect(controller.requestWorkouts).toHaveBeenCalled();
                var lastCall = controller.requestWorkouts.mostRecentCall;
                expect(lastCall.args[0].format(dateFormat)).toEqual(expectedStartDate.format(dateFormat));
                expect(lastCall.args[1].format(dateFormat)).toEqual(expectedEndDate.format(dateFormat));
            });

            it("Should create collection of days the appropriate dates", function()
            {
                spyOn(controller, "createCollectionOfDays").andCallThrough();
                controller.prependWeekToCalendar();
                expect(controller.createCollectionOfDays).toHaveBeenCalled();
                var lastCall = controller.createCollectionOfDays.mostRecentCall;
                expect(lastCall.args[0].format(dateFormat)).toEqual(expectedStartDate.format(dateFormat));
                expect(lastCall.args[1].format(dateFormat)).toEqual(expectedEndDate.format(dateFormat));
            });

            it("Should add seven days to the daysCollection", function()
            {
                spyOn(controller.daysCollection, "add").andCallThrough();
                controller.prependWeekToCalendar();
                expect(controller.daysCollection.add).toHaveBeenCalled();
                var lastCall = controller.daysCollection.add.mostRecentCall;
                expect(lastCall.args[0].length).toEqual(7);
            });

            it("Should call daysCollection.add with index:0 and at:0 options", function()
            {
                spyOn(controller.daysCollection, "add").andCallThrough();
                controller.prependWeekToCalendar();
                expect(controller.daysCollection.add).toHaveBeenCalled();
                var lastCall = controller.daysCollection.add.mostRecentCall;
                expect(lastCall.args[1].at).toBeDefined();
                expect(lastCall.args[1].at).toEqual(0);
                expect(lastCall.args[1].index).toBeDefined();
                expect(lastCall.args[1].index).toEqual(0);
            });
        });

        xdescribe("Append a week to the calendar", function()
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
                spyOn(controller, "requestWorkouts");
                controller.appendWeekToCalendar();
                expect(controller.requestWorkouts).toHaveBeenCalled();
                var lastCall = controller.requestWorkouts.mostRecentCall;
                expect(lastCall.args[0].format(dateFormat)).toEqual(expectedStartDate.format(dateFormat));
                expect(lastCall.args[1].format(dateFormat)).toEqual(expectedEndDate.format(dateFormat));
            });

            it("Should create collection of days the appropriate dates", function()
            {
                spyOn(controller, "createCollectionOfDays").andCallThrough();
                controller.appendWeekToCalendar();
                expect(controller.createCollectionOfDays).toHaveBeenCalled();
                var lastCall = controller.createCollectionOfDays.mostRecentCall;
                expect(lastCall.args[0].format(dateFormat)).toEqual(expectedStartDate.format(dateFormat));
                expect(lastCall.args[1].format(dateFormat)).toEqual(expectedEndDate.format(dateFormat));
            });

            it("Should add seven days to the daysCollection", function()
            {
                spyOn(controller.daysCollection, "add").andCallThrough();
                controller.appendWeekToCalendar();
                expect(controller.daysCollection.add).toHaveBeenCalled();
                var lastCall = controller.daysCollection.add.mostRecentCall;
                expect(lastCall.args[0].length).toEqual(7);
            });

            it("Should call daysCollection.add with correct index option", function()
            {
                spyOn(controller.daysCollection, "add").andCallThrough();
                var lengthBeforeAppending = controller.daysCollection.length;
                controller.appendWeekToCalendar();
                expect(controller.daysCollection.add).toHaveBeenCalled();
                var lastCall = controller.daysCollection.add.mostRecentCall;
                expect(lastCall.args[1].index).toBeDefined();
                expect(lastCall.args[1].index).toEqual(lengthBeforeAppending);
            });
        });

        xdescribe("onItemMoved", function()
        {

            var yesterday = moment().subtract("days", 1).format("YYYY-MM-DD");
            var tomorrow = moment().add("days", 1).format("YYYY-MM-DD");
            var workoutId = "12345678";
            var controller;
            var workout;
            var yesterdayCalendarDay;
            var tomorrowCalendarDay;

            beforeEach(function()
            {
                controller = new CalendarController();
                workout = new WorkoutModel({ WorkoutDay: yesterday + "T00:00:00", WorkoutId: workoutId });
                controller.addWorkoutToCalendarDay(workout);
                controller.workoutsCollection.add(workout);
                yesterdayCalendarDay = controller.getDayModel(yesterday);
                tomorrowCalendarDay = controller.getDayModel(tomorrow);
            });

            it("Should call removeWorkout on yesterday's calendarDay model", function()
            {
                spyOn(yesterdayCalendarDay, "removeWorkout");
                controller.onItemMoved({ workoutId: workoutId, destinationCalendarDayModel: tomorrowCalendarDay });
                expect(yesterdayCalendarDay.removeWorkout).toHaveBeenCalledWith(workout);
            });

            it("Should call addWorkout on tomorrow's calendarDay model", function()
            {
                spyOn(tomorrowCalendarDay, "addWorkout");
                controller.onItemMoved({ workoutId: workoutId, destinationCalendarDayModel: tomorrowCalendarDay });
                expect(tomorrowCalendarDay.addWorkout).toHaveBeenCalledWith(workout);
            });

            it("Should call moveToDay on workout", function()
            {
                spyOn(workout, "moveToDay").andCallThrough();
                controller.onItemMoved({ workoutId: workoutId, destinationCalendarDayModel: tomorrowCalendarDay });
                expect(workout.moveToDay).toHaveBeenCalledWith(tomorrow);
            });

            it("Should move workout back if save fails", function()
            {
                var deferred = $.Deferred();
                spyOn(workout, "save").andReturn(deferred);
                spyOn(tomorrowCalendarDay, "addWorkout");
                spyOn(tomorrowCalendarDay, "removeWorkout");
                spyOn(yesterdayCalendarDay, "addWorkout");
                spyOn(yesterdayCalendarDay, "removeWorkout");

                // move it ...
                controller.onItemMoved({ workoutId: workoutId, destinationCalendarDayModel: tomorrowCalendarDay });
                expect(tomorrowCalendarDay.addWorkout).toHaveBeenCalledWith(workout);
                expect(yesterdayCalendarDay.removeWorkout).toHaveBeenCalledWith(workout);

                // fail - should move back
                deferred.reject();
                expect(tomorrowCalendarDay.removeWorkout).toHaveBeenCalledWith(workout);
                expect(yesterdayCalendarDay.addWorkout).toHaveBeenCalledWith(workout);

            });

        });

    });

});
