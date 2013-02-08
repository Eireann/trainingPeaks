// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "TP",
    "moment",
    "models/workoutModel",
    "models/workoutsCollection",
    "models/calendarCollection"
],
function(TP, moment, WorkoutModel, WorkoutsCollection, CalendarCollection)
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
            expect(collection.getDayModel(dayInsideOfWeek).get("date").unix()).toBe(dayInsideOfWeek.unix());
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
            expect(collection.getDayModel(dayInsideOfWeek).get("date").unix()).toBe(dayInsideOfWeek.unix());

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
                expect(weekCollection.at(0).get("date").format("YYYY-MM-DD")).toBe(startDate.format("YYYY-MM-DD"));
                expect(weekCollection.at(6).get("date").format("YYYY-MM-DD")).toBe(startDate.add("days", 6).format("YYYY-MM-DD"));
                
               
            });

            it("Should create a Backbone.Collection with seven DayModels and one WeekSummaryModel", function()
            {
                var startDate = moment();

                var contextWithSummary = { summaryViewEnabled: true, daysCollection: new TP.Collection() };
                var weekCollectionWithSummary = CalendarCollection.prototype.createWeekCollectionStartingOn.call(contextWithSummary, moment(startDate));

                expect(weekCollectionWithSummary.length).toBe(8);
                expect(weekCollectionWithSummary.at(0).get("date").format("YYYY-MM-DD")).toBe(startDate.format("YYYY-MM-DD"));
                expect(weekCollectionWithSummary.at(6).get("date").format("YYYY-MM-DD")).toBe(startDate.add("days", 6).format("YYYY-MM-DD"));
                expect(weekCollectionWithSummary.at(7).isSummary).toBe(true);
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
    });

});