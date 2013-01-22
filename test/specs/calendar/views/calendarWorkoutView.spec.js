describe("Calendar Workout View", function()
{

    it("Using requirejs to load tests ...", function(done)
    {

        // use requirejs() instead of define() here, to keep jasmine test runner happy
        requirejs(
        [
            "moment",
            "models/workoutModel",
            "views/calendarWorkoutView"
        ],
        function(moment, WorkoutModel, CalendarWorkoutView)
        {

            describe("CalendarWorkoutView ", function()
            {

                it("should be loaded as a module", function()
                {
                    expect(CalendarWorkoutView).toBeDefined();
                });

                it("should watch for model change events", function()
                {
                    expect(CalendarWorkoutView.prototype.modelEvents.change).toBeDefined();
                    expect(CalendarWorkoutView.prototype.modelEvents.change).toEqual("render");
                });

                describe("render", function()
                {

                    it("Should render a calendarWorkoutView if it has a workout", function()
                    {
                        var today = moment();
                        var workoutId = '12345';
                        var workoutModel = new WorkoutModel({ WorkoutId: workoutId, WorkoutDay: today.format() });
                        var workoutView = new CalendarWorkoutView({ model: workoutModel });
                        workoutView.render();
                        expect(workoutView.$el.html()).toContain(workoutId);
                    });

                });
            });

            done();
        });

    });
});