// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "jquery",
    "TP",
    "moment",
    "models/workoutModel",
    "models/workoutsCollection",
    "models/calendarCollection"
],
function($, TP, moment, WorkoutModel, WorkoutsCollection, CalendarCollection)
{
    describe("CalendarCollection ", function()
    {
        it("should load as a module", function()
        {
            expect(CalendarCollection).toBeDefined();
        });

        it("should have a default dateFormat string", function()
        {
            expect(CalendarCollection.prototype.dateFormat).toBe("YYYY-MM-DD");
        });

        it("should have a method to retrieve a specific day inside a Week by the day's date, when the week starts on a Sunday", function()
        {
            var weekStartDate = moment().day(0);

            var collection = new CalendarCollection([], {
                startDate: weekStartDate,
                endDate: moment().day(6).add("weeks", 2)
            });

            var dayInsideOfWeek = moment().day(3);

            expect(function() { collection.getDayModel(dayInsideOfWeek); }).not.toThrow();
            expect(collection.getDayModel(dayInsideOfWeek)).toBeDefined();
            expect(collection.getDayModel(dayInsideOfWeek).get("date")).toBe(dayInsideOfWeek.format("YYYY-MM-DD"));
        });

        it("should have a method to retrieve a specific day inside a Week by the day's date, when the week starts on a Monday", function()
        {

            var weekStartDate = moment().day(1);

            var collection = new CalendarCollection([], {
                startDate: weekStartDate,
                endDate: moment().day(7).add("weeks", 2)
            });

            var dayInsideOfWeek = moment().day(3);

            expect(function() { collection.getDayModel(dayInsideOfWeek); }).not.toThrow();
            expect(collection.getDayModel(dayInsideOfWeek)).toBeDefined();
            expect(collection.getDayModel(dayInsideOfWeek).get("date")).toBe(dayInsideOfWeek.format("YYYY-MM-DD"));

        });

        it("should have a method to add a workout to a day in the collection", function()
        {
            expect(typeof CalendarCollection.prototype.addWorkoutToCalendarDay).toBe("function");
        });

        describe("addWorkoutToCalendarDay", function()
        {
            it("should add a workout (with a workoutDate inside the collection's date range) to the correct day", function()
            {
                var collection = new CalendarCollection([], {
                    startDate: moment().day(1),
                    endDate: moment().day(7).add("weeks", 2)
                });

                var workoutDate = moment().day(4).format("YYYY-MM-DD");
                var workoutId = 'workout1';
                var workout = {
                    getCalendarDay: function() { return workoutDate; },
                    id: workoutId
                };

                var dayModel = collection.getDayModel(workoutDate);
                spyOn(dayModel, "add").andCallThrough();
                collection.addWorkoutToCalendarDay(workout);
                expect(dayModel.add).toHaveBeenCalledWith(workout);
            });
        });

        describe("createWeekCollectionStartingOn", function()
        {
            it("Should create a Backbone.Collection with seven DayModels without WeekSummary", function()
            {
                var startDate = moment();

                var context = { summaryViewEnabled: false, daysCollection: new TP.Collection() };
                var weekCollection = CalendarCollection.prototype.createWeekCollectionStartingOn.call(context, moment(startDate));

                expect(weekCollection.length).toBe(7);
                expect(weekCollection.at(0).get("date")).toBe(startDate.format("YYYY-MM-DD"));
                expect(weekCollection.at(6).get("date")).toBe(startDate.add("days", 6).format("YYYY-MM-DD"));
                
               
            });

            it("Should create a Backbone.Collection with seven DayModels and one WeekSummaryModel", function()
            {
                var startDate = moment();

                var contextWithSummary = { summaryViewEnabled: true, daysCollection: new TP.Collection() };
                var weekCollectionWithSummary = CalendarCollection.prototype.createWeekCollectionStartingOn.call(contextWithSummary, moment(startDate));

                expect(weekCollectionWithSummary.length).toBe(8);
                expect(weekCollectionWithSummary.at(0).get("date")).toBe(startDate.format("YYYY-MM-DD"));
                expect(weekCollectionWithSummary.at(6).get("date")).toBe(startDate.add("days", 6).format("YYYY-MM-DD"));
                expect(weekCollectionWithSummary.at(7).isSummary).toBe(true);
            });

            it("Should add seven days to the daysCollection", function()
            {
                var startDate = moment();

                var daysSpy = jasmine.createSpyObj("DaysCollection spy", ["add"]);
                var context = { summaryViewEnabled: false, daysCollection: daysSpy };
                var weekCollection = CalendarCollection.prototype.createWeekCollectionStartingOn.call(context, moment(startDate));
                expect(daysSpy.add).toHaveBeenCalled();
                expect(daysSpy.add.calls.length).toEqual(7);
            });

        });

        describe("Request workouts", function()
        {
            it("Should call CalendarCollection.addWorkoutToCalendarDay for each workout returned", function()
            {

                var collection = new CalendarCollection([], {
                    startDate: moment().day(0),
                    endDate: moment().day(6).add("weeks", 2)
                });

                // fake workout collection fetcher
                var workouts =
                [
                        new WorkoutModel({ workoutDay: moment().add("days", 1).format(), workoutId: '1234' }),
                        new WorkoutModel({ workoutDay: moment().add("days", 2).format(), workoutId: '2345' }),
                        new WorkoutModel({ workoutDay: moment().add("days", 3).format(), workoutId: '3456' })
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

                spyOn(collection, "addWorkoutToCalendarDay");
                spyOn(collection.workoutsCollection, "add");

                var startDate = moment();
                var endDate = moment().add("days", 3);
                collection.requestWorkouts(startDate, endDate);

                expect(collection.addWorkoutToCalendarDay).toHaveBeenCalled();

                _.each(workouts, function(workout)
                {
                    expect(collection.addWorkoutToCalendarDay).toHaveBeenCalledWith(workout);
                    expect(collection.workoutsCollection.add).toHaveBeenCalledWith(workout);
                });

            });

        });

        describe("Prepend a week to the calendar", function()
        {

            var collection;
            var expectedStartDate;
            var expectedEndDate;
            var dateFormat = "YYYY-MM-DD";

            beforeEach(function()
            {
                collection = new CalendarCollection([], {
                    startDate: moment().day(0),
                    endDate: moment().day(6).add("weeks", 2)
                });

                expectedEndDate = moment(collection.startDate).subtract("days", 1);
                expectedStartDate = moment(expectedEndDate).subtract("days", 6);
            });

            it("Should create collection of days the appropriate dates", function()
            {
                spyOn(collection, "createWeekCollectionStartingOn").andCallThrough();
                collection.prependWeek(expectedStartDate);
                expect(collection.createWeekCollectionStartingOn).toHaveBeenCalled();
                var lastCall = collection.createWeekCollectionStartingOn.mostRecentCall;
                expect(lastCall.args[0].format(dateFormat)).toEqual(expectedStartDate.format(dateFormat));
            });


            it("Should call collection.add with at:0 and append:false options", function()
            {
                spyOn(collection, "add").andCallThrough();
                collection.prependWeek(expectedStartDate);
                expect(collection.add).toHaveBeenCalled();
                var lastCall = collection.add.mostRecentCall;
                expect(lastCall.args[1].at).toBeDefined();
                expect(lastCall.args[1].at).toEqual(0);
                expect(lastCall.args[1].append).toBeDefined();
                expect(lastCall.args[1].append).toBe(false);
            });
        });

        describe("Append a week to the calendar", function()
        {

            var collection;
            var expectedStartDate;
            var expectedEndDate;
            var dateFormat = "YYYY-MM-DD";

            beforeEach(function()
            {
                collection = new CalendarCollection([], {
                    startDate: moment().day(0),
                    endDate: moment().day(6).add("weeks", 2)
                });

                expectedStartDate = moment(collection.endDate).add("days", 1);
                expectedEndDate = moment(expectedStartDate).add("days", 6);
            });


            it("Should create collection of days the appropriate dates", function()
            {
                spyOn(collection, "createWeekCollectionStartingOn").andCallThrough();
                collection.appendWeek(expectedStartDate);
                expect(collection.createWeekCollectionStartingOn).toHaveBeenCalled();
                var lastCall = collection.createWeekCollectionStartingOn.mostRecentCall;
                expect(lastCall.args[0].format(dateFormat)).toEqual(expectedStartDate.format(dateFormat));
            });

            it("Should call collection.add with append option", function()
            {
                spyOn(collection, "add").andCallThrough();
                collection.appendWeek(expectedStartDate);
                expect(collection.add).toHaveBeenCalled();
                var lastCall = collection.add.mostRecentCall;
                expect(lastCall.args[1].append).toBeDefined();
                expect(lastCall.args[1].append).toBe(true);
            });
        });

        describe("onItemMoved", function()
        {
            var yesterday = moment().subtract("days", 1).format("YYYY-MM-DD");
            var tomorrow = moment().add("days", 1).format("YYYY-MM-DD");
            var workoutId = "12345678";
            var collection;
            var workout;
            var yesterdayCalendarDay;
            var tomorrowCalendarDay;

            beforeEach(function()
            {
                collection = new CalendarCollection([], {
                    startDate: moment().day(0),
                    endDate: moment().day(6).add("weeks", 2)
                });
                workout = new WorkoutModel({ workoutDay: yesterday + "T00:00:00", workoutId: workoutId });
                collection.addWorkoutToCalendarDay(workout);
                collection.workoutsCollection.add(workout);
                yesterdayCalendarDay = collection.getDayModel(yesterday);
                tomorrowCalendarDay = collection.getDayModel(tomorrow);
            });

            it("Should call remove on yesterday's calendarDay model", function()
            {
                spyOn(yesterdayCalendarDay, "remove");
                collection.onItemMoved({ ItemId: workoutId, destinationCalendarDayModel: tomorrowCalendarDay });
                expect(yesterdayCalendarDay.remove).toHaveBeenCalledWith(workout);
            });

            it("Should call add on tomorrow's calendarDay model", function()
            {
                spyOn(tomorrowCalendarDay, "add");
                collection.onItemMoved({ ItemId: workoutId, destinationCalendarDayModel: tomorrowCalendarDay });
                expect(tomorrowCalendarDay.add).toHaveBeenCalledWith(workout);
            });

            it("Should call moveToDay on workout", function()
            {
                spyOn(workout, "moveToDay").andCallThrough();
                collection.onItemMoved({ ItemId: workoutId, destinationCalendarDayModel: tomorrowCalendarDay });
                expect(workout.moveToDay).toHaveBeenCalledWith(tomorrow);
            });

            it("Should move workout back if save fails", function()
            {
                var deferred = $.Deferred();
                spyOn(workout, "save").andReturn(deferred);
                spyOn(tomorrowCalendarDay, "add");
                spyOn(tomorrowCalendarDay, "remove");
                spyOn(yesterdayCalendarDay, "add");
                spyOn(yesterdayCalendarDay, "remove");

                // move it ...
                collection.onItemMoved({ ItemId: workoutId, destinationCalendarDayModel: tomorrowCalendarDay });
                expect(tomorrowCalendarDay.add).toHaveBeenCalledWith(workout);
                expect(yesterdayCalendarDay.remove).toHaveBeenCalledWith(workout);

                // fail - should move back
                deferred.reject();
                expect(tomorrowCalendarDay.remove).toHaveBeenCalledWith(workout);
                expect(yesterdayCalendarDay.add).toHaveBeenCalledWith(workout);

            });

        });

        it("Sets up the weeks based on a start and end date ", function ()
        {
            expect(CalendarCollection.prototype.setUpWeeks).toBeDefined();
            expect(typeof CalendarCollection.prototype.setUpWeeks).toBe("function");

            var i = 0;
            var context =
            {
                workoutsCollection: new TP.Collection(),
                daysCollection: new TP.Collection(),
                add: function ()
                {
                    i++;
                },
                createWeekCollectionStartingOn: function() {}                
            };
            
            spyOn(context.workoutsCollection, "reset");
            spyOn(context.daysCollection, "reset");

            var startDate = moment("2013-01-01");
            var endDate = moment("2013-03-01");
            CalendarCollection.prototype.setUpWeeks.call(context, startDate, endDate);

            expect(context.startDate.unix()).toBe(startDate.unix());
            expect(context.endDate.unix()).toBe(endDate.unix());
            expect(context.workoutsCollection.reset).toHaveBeenCalled();
            expect(context.daysCollection.reset).toHaveBeenCalled();
            expect(i).toBe(9);
        });
    });
});