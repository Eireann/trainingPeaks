describe("Calendar Day View", function()
{

    it("Using requirejs to load tests ...", function(done)
    {

        // use requirejs() instead of define() here, to keep jasmine test runner happy
        requirejs(
        [
            "moment",
            "scripts/helpers/printDate",
            "models/calendarDay",
            "models/workoutModel",
            "views/calendarWorkoutView",
            "views/calendarDayView"
        ],
        function(moment, printDate, CalendarDayModel, WorkoutModel, CalendarWorkoutView, CalendarDayView)
        {

            describe("CalendarDayView ", function()
            {

                it("should be loaded as a module", function()
                {
                    expect(CalendarDayView).toBeDefined();
                });

                it("should watch for model change events", function()
                {
                    expect(CalendarDayView.prototype.modelEvents.change).toBeDefined();
                    expect(CalendarDayView.prototype.modelEvents.change).toEqual("render");
                });

                describe("render", function()
                {

                    // this className won't break anything in the javascript, but the css is depending on it
                    it("Should have 'day' css class", function()
                    {
                        var dayModel = new CalendarDayModel({ date: moment() });
                        var dayView = new CalendarDayView({ model: dayModel });
                        dayView.render();
                        expect(dayView.$el.hasClass('day')).toBeTruthy();
                    });

                    it("Should add a 'today' class if the date is today", function()
                    {
                        var today = moment();
                        var dayModel = new CalendarDayModel({ date: today });
                        var dayView = new CalendarDayView({ model: dayModel });
                        dayView.render();
                        expect(dayView.$el.hasClass('today')).toBeTruthy();
                    });

                    it("Should not add a 'today' class if the date is not today", function()
                    {
                        var tomorrow = moment().add("days", 1);
                        var dayModel = new CalendarDayModel({ date: tomorrow });
                        var dayView = new CalendarDayView({ model: dayModel });
                        dayView.render();
                        expect(dayView.$el.hasClass('today')).toBeFalsy();
                    });

                    it("Should render a date", function()
                    {
                        var today = moment();
                        var dayModel = new CalendarDayModel({ date: today });
                        var dayView = new CalendarDayView({ model: dayModel });
                        dayView.render();
                        expect(dayView.$el.html()).toContain(printDate(today));
                    });

                    describe("Render workout", function()
                    {

                        it("Should render a calendarWorkoutView if it has a workout", function()
                        {
                            var today = moment();
                            var workoutModel = new WorkoutModel({ WorkoutId: '12345', WorkoutDay: today.format() });
                            var dayModel = new CalendarDayModel({ date: today });
                            dayModel.setWorkout(workoutModel);
                            var dayView = new CalendarDayView({ model: dayModel });

                            spyOn(CalendarWorkoutView.prototype, "render").andCallThrough();
                            dayView.render();
                            expect(CalendarWorkoutView.prototype.render).toHaveBeenCalled();

                            var workoutView = new CalendarWorkoutView({ model: workoutModel });
                            workoutView.render();
                            expect(dayView.$el.html()).toContain(workoutView.el.outerHTML);
                        });
                    });

                });
            });

            done();
        });

    });
});