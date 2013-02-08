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
                expect(controller.startDate.unix()).toBe(expectedStartDate.unix());
            });

            it("Should have an endDate set to the end of the week six weeks from now", function()
            {
                var controller = new CalendarController();
                expect(controller.endDate).toBeDefined();

                var expectedEndDate = moment().day(6).add("weeks", 6);
                expect(controller.endDate.unix()).toBe(expectedEndDate.unix());
            });

            it("Should have a weeksCollection", function()
            {
                var controller = new CalendarController();
                expect(controller.weeksCollection).toBeDefined();
                expect(controller.weeksCollection).not.toBeNull();
            });
        });

        xdescribe("initializeCalendar", function()
        {
            it("Should create a CalendarView", function()
            {
                var controller = new CalendarController();
                spyOn(CalendarView.prototype, "initialize").andCallThrough();
                controller.initializeCalendar();
                expect(CalendarView.prototype.initialize).toHaveBeenCalled();
            });

            it("Should bind to calendar view 'prepend' event", function()
            {
                var controller = new CalendarController();
                spyOn(CalendarView.__super__, "on").andCallThrough();
                controller.initializeCalendar();
                expect(CalendarView.__super__.on).toHaveBeenCalledWith("prepend", controller.prependWeekToCalendar, controller);
            });

            it("Should bind to calendar view 'append' event", function()
            {
                var controller = new CalendarController();
                spyOn(CalendarView.__super__, "on").andCallThrough();
                controller.initializeCalendar();
                expect(CalendarView.__super__.on).toHaveBeenCalledWith("append", controller.appendWeekToCalendar, controller);
            });

            it("Should bind to calendar view 'itemMoved' event", function()
            {
                var controller = new CalendarController();
                spyOn(CalendarView.__super__, "on").andCallThrough();
                controller.initializeCalendar();
                expect(CalendarView.__super__.on).toHaveBeenCalledWith("itemMoved", controller.onItemMoved, controller);
            });
        });

        xdescribe("createWeekCollectionStartingOn", function()
        {
            it("Should create a Backbone.Collection with seven DayModels without WeekSummary", function()
            {
                var startDate = moment();

                var context = { summaryViewEnabled: false };
                var weekCollection = CalendarController.prototype.createWeekCollectionStartingOn.call(context, moment(startDate));

                expect(weekCollection.length).toBe(7);
                expect(weekCollection.at(0).get("date").unix()).toBe(startDate.unix());
                expect(weekCollection.at(6).get("date").unix()).toBe(startDate.add("days", 6).unix());
                
               
            });

            it("Should create a Backbone.Collection with seven DayModels and one WeekSummaryModel", function()
            {
                var startDate = moment();

                var contextiWithSummary = { summaryViewEnabled: true };
                var weekCollectionWithSummary = CalendarController.prototype.createWeekCollectionStartingOn.call(contextiWithSummary, moment(startDate));

                expect(weekCollectionWithSummary.length).toBe(8);
                expect(weekCollectionWithSummary.at(0).get("date").unix()).toBe(startDate.unix());
                expect(weekCollectionWithSummary.at(6).get("date").unix()).toBe(startDate.add("days", 6).unix());
                expect(weekCollectionWithSummary.at(7).isSummary).toBe(true);
            });
        });

        xdescribe("Request workouts", function()
        {
            it("Should call CalendarController.weeksCollection.addWorkoutToCalendarDay for each workout returned", function()
            {
                var controller = new CalendarController();

                // fake workout collection fetcher
                var workouts =
                [
                        new WorkoutModel({ WorkoutDay: moment().add("days", 1).format(), WorkoutId: '1234' }),
                        new WorkoutModel({ WorkoutDay: moment().add("days", 2).format(), WorkoutId: '2345' }),
                        new WorkoutModel({ WorkoutDay: moment().add("days", 3).format(), WorkoutId: '3456' })
                ];

                spyOn(WorkoutsCollection.__super__, "fetch").andCallFake(function()
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
                });

                spyOn(controller.weeksCollection, "addWorkoutToCalendarDay");
                spyOn(controller.workoutsCollection, "add");

                var startDate = moment();
                var endDate = moment().add("days", 3);
                controller.requestWorkouts(startDate, endDate);

                expect(controller.weeksCollection.addWorkoutToCalendarDay).toHaveBeenCalled();

                _.each(workouts, function(workout)
                {
                    expect(controller.weeksCollection.addWorkoutToCalendarDay).toHaveBeenCalledWith(workout);
                    expect(controller.weeksCollection.workoutsCollection.add).toHaveBeenCalledWith(workout);
                });

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
                controller.weeksCollection.addWorkoutToCalendarDay(workout);
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
