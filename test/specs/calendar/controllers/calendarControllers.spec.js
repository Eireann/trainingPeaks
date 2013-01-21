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
        "controllers/calendarController",
        "models/workoutsCollection",
        "views/calendarView"],
        function(moment, CalendarController, WorkoutsCollection, CalendarView)
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

                    it("Should create a workout collection with the correct dates", function()
                    {
                        /*
                        var startDate = moment("2013-01-01");
                        var endDate = moment("2013-01-10");
                        var controller = new CalendarController();
                        controller.requestWorkouts(startDate, endDate);
                        expect(WorkoutsCollection.__super__.initialize).toHaveBeenCalled();
                        var callArgs = WorkoutsCollection.__super__.initialize.mostRecentCall.args;
                        console.log(callArgs);
                        expect(callArgs.endDate).toEqual(endDate);
                        expect(callArgs.startDate).toEqual(startDate);
                        */
                    });

                    it("Should call WorkoutsCollection.fetch", function()
                    {
                        spyOn(WorkoutsCollection.__super__, "fetch").andCallThrough();
                        var startDate = moment("2013-01-01");
                        var endDate = moment("2013-01-12");
                        var controller = new CalendarController();
                        controller.requestWorkouts(startDate, endDate);
                        expect(WorkoutsCollection.__super__.fetch).toHaveBeenCalled();
                    });
                });


            });

            // have to call done() after our final test
            done();
        });

    });

});