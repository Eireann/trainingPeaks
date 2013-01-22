describe("Calendar Controller spec", function()
{

    // Use 'it("",function(done) ' - this makes jasmine wait for done() to be called,
    // or else some of our tests won't run if requirejs files don't return in time
    it("Loading controller tests via requirejs", function(done)
    {

        // use requirejs() here, not define(), for jasmine compatibility
        requirejs(
        [
        "moment",
        "jquery",
        "controllers/calendarController",
        "models/workoutModel",
        "models/workoutsCollection",
        "views/calendarView"],
        function(moment, $, CalendarController, WorkoutModel, WorkoutsCollection, CalendarView)
        {

            describe("Calendar Controller", function()
            {

                it("should load successfully as a module", function()
                {
                    expect(CalendarController).toBeDefined();
                });

                it("should have a layout", function()
                {
                    var controller = new CalendarController();
                    expect(controller.layout).toBeDefined();
                });

                describe("Initialize controller", function()
                {
                    it("should have a startDate", function()
                    {
                        var controller = new CalendarController();
                        expect(controller.startDate).toBeDefined();
                    });

                    it("should have an endDate", function()
                    {
                        var controller = new CalendarController();
                        expect(controller.endDate).toBeDefined();
                    });

                    it("should fetch some workouts", function()
                    {
                        spyOn(WorkoutsCollection.__super__, "fetch").andCallThrough();
                        var controller = new CalendarController();
                        expect(WorkoutsCollection.__super__.fetch).toHaveBeenCalled();
                    });

                    it("should create a CalendarView", function()
                    {
                        spyOn(CalendarView.__super__, "initialize").andCallThrough();
                        var controller = new CalendarController();
                        expect(CalendarView.__super__.initialize).toHaveBeenCalled();
                    });

                    it("Should call initializeCalendar", function()
                    {
                        spyOn(CalendarController.prototype, "initializeCalendar");
                        var controller = new CalendarController();
                        expect(CalendarController.prototype.initializeCalendar).toHaveBeenCalled();
                    });

                });

                describe("Create collection of days", function()
                {

                    it("Should create a collection with the right number of days", function()
                    {
                        var startDate = moment("2013-01-01");
                        var endDate = moment("2013-01-10");
                        var controller = new CalendarController();
                        var days = controller.createCollectionOfDays(startDate, endDate);
                        expect(days.length).toEqual(10);
                    });

                    it("Should add the days to daysHash", function()
                    {
                        var startDate = moment("2013-01-01");
                        var endDate = moment("2013-01-02");
                        var controller = new CalendarController();
                        var days = controller.createCollectionOfDays(startDate, endDate);
                        expect(controller.daysHash['2013-01-01']).toBe(days.models[0]);
                        expect(controller.daysHash['2013-01-02']).toBe(days.models[1]);
                    });
                });

                describe("Request workouts", function()
                {

                    it("Should create a workout collection with the correct date range", function()
                    {
                        spyOn(WorkoutsCollection.__super__, "fetch").andCallThrough();
                        var controller = new CalendarController();
                        var startDate = moment("2013-01-07");
                        var endDate = moment("2013-01-13");
                        controller.requestWorkouts(startDate, endDate);
                        expect(WorkoutsCollection.__super__.fetch).toHaveBeenCalled();
                        expect(WorkoutsCollection.__super__.fetch.mostRecentCall.object.startDate.format()).toEqual(startDate.format());
                        expect(WorkoutsCollection.__super__.fetch.mostRecentCall.object.endDate.format()).toEqual(endDate.format());
                    });

                    it("Should add Workout model to CalendarDay model if the date matches", function()
                    {
                        var controller = new CalendarController();
                        var todayCalendarDay = controller.daysHash[moment().format("YYYY-MM-DD")];
                        spyOn(todayCalendarDay, "setWorkout");
                        var workout = new WorkoutModel({ WorkoutDay: moment().format() });
                        controller.addWorkoutToCalendarDay(workout);
                        expect(todayCalendarDay.setWorkout).toHaveBeenCalledWith(workout);
                    });

                });


                describe("Prepend a week to the calendar", function()
                {

                    it("Should bind prepend event on initialize", function()
                    {

                        spyOn(CalendarView.prototype, "bind");
                        var controller = new CalendarController();
                        expect(CalendarView.prototype.bind).toHaveBeenCalled();
                    });
                });


            });

            // have to call done() after our final test
            done();
        });

    });

});